import { Room } from "livekit-client";

export const connectToRoom = async (token: string) => {
    const room = new Room();

    await room.connect("ws://localhost:7880", token);

    return room;
};