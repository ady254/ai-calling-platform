"use client";

import { useState } from "react";
import { connectToRoom } from "@/services/livekit-service";
import { Mic, MicOff, Phone, PhoneOff, Activity } from "lucide-react";

export default function LiveCall() {
    const [room, setRoom] = useState<any>(null);
    const [connected, setConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const startCall = async () => {
        setIsConnecting(true);
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first ❌");
                setIsConnecting(false);
                return;
            }

            const res = await fetch(
                "http://localhost:8000/livekit/token?room_name=test-room&user_id=dev-user",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                throw new Error("Failed to fetch token");
            }

            const data = await res.json();

            console.log("LiveKit token:", data);

            if (!data.token) {
                alert("Token not received ❌");
                setIsConnecting(false);
                return;
            }

            const newRoom = await connectToRoom(data.token);

            // 👂 Listen for incoming AI audio tracks and play them!
            newRoom.on("trackSubscribed", (track) => {
                if (track.kind === "audio") {
                    const audioElement = track.attach();
                    document.body.appendChild(audioElement);
                }
            });

            setRoom(newRoom);
            setConnected(true);

            // 🎤 Enable mic
            await newRoom.localParticipant.setMicrophoneEnabled(true);

        } catch (err) {
            console.error("Call error:", err);
            alert("Error starting call");
        } finally {
            setIsConnecting(false);
        }
    };

    const endCall = () => {
        room?.disconnect();
        setConnected(false);
        setRoom(null);
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100">

            <div className="relative mb-12 mt-8">
                {/* Status Ring */}
                <div className={`absolute -inset-8 rounded-full opacity-20 blur-xl transition-all duration-1000 ${connected ? "bg-emerald-500 animate-pulse-slow" : isConnecting ? "bg-amber-500 animate-pulse" : "bg-indigo-500"
                    }`}></div>

                {/* Main Avatar / Icon */}
                <div className="relative w-32 h-32 rounded-full bg-white shadow-xl shadow-slate-200/50 border-4 border-white flex items-center justify-center overflow-hidden z-10">
                    {connected ? (
                        <div className="flex items-center justify-center w-full h-full bg-emerald-50 text-emerald-500">
                            <Activity className="w-12 h-12 animate-pulse" strokeWidth={1.5} />
                        </div>
                    ) : (
                        <div className="flex text-4xl font-light text-slate-300">
                            AI
                        </div>
                    )}
                </div>

                {/* Status Indicator Dot */}
                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white z-20 ${connected ? "bg-emerald-500" : isConnecting ? "bg-amber-500" : "bg-slate-300"
                    }`}></div>
            </div>

            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Receptionist</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="relative flex h-2.5 w-2.5">
                        {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    </span>
                    <p className="text-slate-500 font-medium text-sm">
                        {connected ? "Session Active - Speak Now" : isConnecting ? "Connecting..." : "Ready to connect"}
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                {!connected ? (
                    <button
                        onClick={startCall}
                        disabled={isConnecting}
                        className={`flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all ${isConnecting ? "opacity-70 cursor-not-allowed scale-95" : "hover:scale-105 active:scale-95"
                            }`}
                    >
                        <Phone className="w-5 h-5" fill="currentColor" stroke="none" />
                        {isConnecting ? "Initiating Call..." : "Start Voice Call"}
                    </button>
                ) : (
                    <>
                        <button
                            className="flex items-center justify-center w-14 h-14 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                            title="Mute Microphone"
                        >
                            <Mic className="w-6 h-6" />
                        </button>
                        <button
                            onClick={endCall}
                            className="flex items-center gap-3 bg-rose-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:shadow-rose-500/40 transition-all hover:scale-105 active:scale-95"
                        >
                            <PhoneOff className="w-5 h-5" fill="currentColor" stroke="none" />
                            End Session
                        </button>
                    </>
                )}
            </div>

        </div>
    );
}