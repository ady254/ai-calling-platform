import { useState, useRef, useCallback } from "react";
import { Room } from "livekit-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useCalling = (authToken: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const sessionId = useRef<string>(crypto.randomUUID());

  const joinRoom = useCallback(async () => {
    if (!authToken) {
      alert("Please login first");
      return;
    }

    try {
      console.log("Fetching token...");
      const res = await fetch(
        `${API_URL}/livekit/token?room_name=test-room`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await res.json();
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      
      newRoom.on("connected", () => console.log("CONNECTED 🔥"));
      newRoom.on("disconnected", () => console.log("DISCONNECTED ❌"));

      // Use LiveKit URL from backend response
      const livekitUrl = data.livekit_url || process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://innvox-um8kvrmw.livekit.cloud";
      await newRoom.connect(livekitUrl, data.token);

      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setRoom(newRoom);
    } catch (err) {
      console.error("JOIN ERROR ❌:", err);
    }
  }, [authToken]);

  const sendToAI = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
      }

      const res = await fetch(`${API_URL}/agent/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId.current,
        }),
      });
      const data = await res.json();
      const audio = new Audio(`${API_URL}/${data.audio}?t=${Date.now()}`);
      currentAudio.current = audio;
      audio.play();
    } catch (err) {
      console.error("Error", err);
    }
  }, []);

  const resetSession = useCallback(async () => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }

    try {
      await fetch(`${API_URL}/agent/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ session_id: sessionId.current }),
      });
    } catch (err) {
      console.error("Reset error", err);
    }

    sessionId.current = crypto.randomUUID();
  }, []);

  return { room, joinRoom, sendToAI, resetSession };
};
