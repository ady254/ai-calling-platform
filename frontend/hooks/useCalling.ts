import { useState, useCallback } from "react";
import { Room } from "livekit-client";
import { toast } from "sonner";
import { api } from "@/services/api";

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
      toast.error("Please log in first");
      return;
    }

    try {
      const res = await api.get("/livekit/token", {
        params: { room_name: "test-room" },
      });
      const data = res.data;

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      newRoom.on("connected", () => console.log("LiveKit room connected"));
      newRoom.on("disconnected", () => console.log("LiveKit room disconnected"));

      const livekitUrl = data.livekit_url || process.env.NEXT_PUBLIC_LIVEKIT_URL;
      if (!livekitUrl) {
        toast.error("Live call is not configured (missing LiveKit URL)");
        return;
      }
      await newRoom.connect(livekitUrl, data.token);

      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setRoom(newRoom);
    } catch (err) {
      console.error("Failed to join LiveKit room:", err);
      toast.error("Couldn't start the live session. Please try again.");
    }
  }, [authToken]);

  return { room, joinRoom };
};
