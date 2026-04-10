
import { Room } from "livekit-client";

export const connectToRoom = async (token: string) => {
    const room = new Room();

    await room.connect("wss://innvox-um8kvrmw.livekit.cloud", token);

    return room;
};