import { useState } from "react";
import { Room } from "livekit-client";


function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await res.json();
      if (data.access_token) {
        setAuthToken(data.access_token);
        console.log("Logged in successfully");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Failed to connect to backend");
    }
  };
  const joinRoom = async () => {
    if (!authToken) {
      alert("Please login first");
      return;
    }

    try {
      console.log("Fetching token...");

      const res = await fetch(
        "http://127.0.0.1:8000/livekit/token?room_name=test-room",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await res.json();
      console.log("TOKEN:", data);

      const newRoom = new Room();

      // 🔥 ADD EVENT LISTENERS
      newRoom.on("connected", () => {
        console.log("ROOM CONNECTED 🔥");
      });

      newRoom.on("disconnected", () => {
        console.log("ROOM DISCONNECTED ❌");
      });

      newRoom.on("participantConnected", (p) => {
        console.log("Participant joined:", p.identity);
      });

      console.log("Connecting to LiveKit...");

      await newRoom.connect(
        "wss://innvox-um8kvrmw.livekit.cloud",
        data.token
      );

      console.log("Enabling mic...");

      await newRoom.localParticipant.enableCameraAndMicrophone();

      console.log("FINAL: Connected successfully ✅");

      setRoom(newRoom);

    } catch (err) {
      console.error("JOIN ERROR ❌:", err);
    }
  };

  const sendToAI = async (text: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/agent/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      console.log(data);

      const audio = new Audio(`http://127.0.0.1:8000/${data.audio}`);
      audio.play();
    } catch (err) {
      console.error("Error", err);
    }
  };

  const callAI = async () => {
    await sendToAI("Hello, please introduce yourself.");
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;

      console.log("User said:", text);

      sendToAI(text);
    };
  };

  if (!authToken) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
        <form onSubmit={handleLogin} style={{ padding: "40px", background: "white", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
          <h2 style={{ marginBottom: "20px", textAlign: "center", color: "#1a73e8" }}>Login to AI Platform</h2>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#5f6368" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #dadce0" }}
            />
          </div>
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", marginBottom: "5px", color: "#5f6368" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #dadce0" }}
            />
          </div>
          <button
            type="submit"
            style={{ width: "100%", padding: "12px", background: "#1a73e8", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#2c3e50", margin: 0 }}>AI Calling Platform</h1>
        <button
          onClick={() => setAuthToken(null)}
          style={{ padding: "5px 15px", background: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <button
          onClick={joinRoom}
          style={{ padding: "10px 20px", background: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Join Call
        </button>
        <button
          onClick={callAI}
          style={{ padding: "10px 20px", background: "#2ecc71", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Call AI (Intro)
        </button>
        <button
          onClick={startListening}
          style={{ padding: "10px 20px", background: "#e67e22", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          🎤 Speak
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", padding: "20px", background: "#f8f9fa", borderRadius: "10px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message for AI..."
          style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "1px solid #ddd" }}
          onKeyPress={(e) => e.key === 'Enter' && sendToAI(message)}
        />
        <button
          onClick={() => sendToAI(message)}
          style={{ padding: "10px 25px", background: "#9b59b6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>

      {room && <p style={{ marginTop: "20px", color: "#27ae60" }}>Connected to LiveKit ✅</p>}
    </div>
  );
}

export default App;