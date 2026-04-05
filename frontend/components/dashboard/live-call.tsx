import { useState } from "react";
import { connectToRoom } from "@/services/livekit-service";

export default function LiveCall() {
    const [room, setRoom] = useState<any>(null);
    const [connected, setConnected] = useState(false);

    const startCall = async () => {
        // 🔑 Get token from backend
        // Note: In production you'd need authentication and room_name here
        const res = await fetch("http://localhost:5000/livekit/token?room_name=test-room&user_id=dev-user");
        const data = await res.json();

        if (data.token) {
            const newRoom = await connectToRoom(data.token);
            setRoom(newRoom);
            setConnected(true);
            
            // 🎤 Enable mic
            await newRoom.localParticipant.setMicrophoneEnabled(true);
        }
    };

    const endCall = () => {
        room?.disconnect();
        setConnected(false);
    };

    return (
        <div className="p-4">

            <h2>AI Voice Call</h2>

            {!connected ? (
                <button onClick={startCall}>
                    Start Call 📞
                </button>
            ) : (
                <button onClick={endCall}>
                    End Call ❌
                </button>
            )}

        </div>
    );
}