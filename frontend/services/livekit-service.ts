import { Room } from "livekit-client";

const DEFAULT_LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://innvox-um8kvrmw.livekit.cloud";

export const connectToRoom = async (token: string, url?: string) => {
    const room = new Room({
        adaptiveStream: true,
        dynacast: true,
    });

    await room.connect(url || DEFAULT_LIVEKIT_URL, token);

    return room;
};