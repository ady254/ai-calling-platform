import { useState, useCallback } from "react";
import { Room } from "livekit-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Joins the authenticated user's LiveKit room for a live voice session.
 *
 * Previously this hook also exposed `sendToAI`/`resetSession`, which posted
 * to `/agent/start` and `/agent/reset` — routes that don't exist on the
 * backend (only `/agent/internal/*`, `/agent/preview`, and the CRUD routes
 * are defined in agent_routes.py). Since nothing in the app called this
 * hook, those two functions silently 404'd forever. Removed rather than
 * left as dead, broken code; re-add once a real text-chat endpoint exists.
 */
export const useCalling = (authToken: string | null) => {
  const [room, setRoom] = useState<Room | null>(null);

  const joinRoom = useCallback(async () => {
    if (!authToken) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/livekit/token?room_name=test-room`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch LiveKit token:", res.status, await res.text());
        return;
      }

      const data = await res.json();
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      newRoom.on("connected", () => console.log("LiveKit room connected"));
      newRoom.on("disconnected", () => console.log("LiveKit room disconnected"));

      const livekitUrl = data.livekit_url || process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) {
        console.error("No LiveKit URL available (set NEXT_PUBLIC_LIVEKIT_URL)");
        return;
      }
      await newRoom.connect(livekitUrl, data.token);

      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setRoom(newRoom);
    } catch (err) {
      console.error("Failed to join LiveKit room:", err);
    }
  }, [authToken]);

  return { room, joinRoom };
};
