"use client";

import { useState, useEffect, useRef } from "react";
import { Room, RoomEvent, Track, RemoteTrackPublication, RemoteParticipant } from "livekit-client";
import { Mic, MicOff, Phone, PhoneOff, Activity, Volume2 } from "lucide-react";

interface LiveCallProps {
    campaignId?: string;
    contactId?: string;
}

export default function LiveCall({ campaignId, contactId }: LiveCallProps) {
    const [room, setRoom] = useState<Room | null>(null);
    const [connected, setConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [agentSpeaking, setAgentSpeaking] = useState(false);
    const [statusText, setStatusText] = useState("Ready to connect");
    const audioElementsRef = useRef<HTMLAudioElement[]>([]);
    const startTimeRef = useRef<Date | null>(null);

    // Use passed contactId or fallback to placeholder for testing
    const activeContactId = contactId || "71da3877-026b-49a2-9304-05dad8847a53";

    // Cleanup audio elements on unmount
    useEffect(() => {
        return () => {
            audioElementsRef.current.forEach((el) => {
                el.pause();
                el.remove();
            });
        };
    }, []);

    const startCall = async () => {
        setIsConnecting(true);
        setStatusText("Connecting...");
        startTimeRef.current = new Date();

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first");
                setIsConnecting(false);
                setStatusText("Ready to connect");
                return;
            }

            // Build URL with query params
            let url = "http://localhost:8000/livekit/token?room_name=test-room";
            if (campaignId) url += `&campaign_id=${campaignId}`;
            if (activeContactId) url += `&contact_id=${activeContactId}`;

            // Fetch LiveKit token and URL from backend
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch token");
            }

            const data = await res.json();

            if (!data.token) {
                alert("Token not received");
                setIsConnecting(false);
                setStatusText("Ready to connect");
                return;
            }

            const newRoom = new Room({
                adaptiveStream: true,
                dynacast: true,
            });

            // Listen for AI agent audio tracks and play them
            newRoom.on(
                RoomEvent.TrackSubscribed,
                (track, publication, participant) => {
                    console.log(`Track subscribed: ${track.kind} from ${participant.identity}`);

                    if (track.kind === Track.Kind.Audio) {
                        const audioElement = track.attach();
                        audioElement.autoplay = true;
                        audioElement.volume = 1.0;
                        document.body.appendChild(audioElement);
                        audioElementsRef.current.push(audioElement);
                        setAgentSpeaking(true);

                        console.log("AI audio track attached and playing");
                    }
                }
            );

            // Track when audio stops
            newRoom.on(
                RoomEvent.TrackUnsubscribed,
                (track, publication, participant) => {
                    if (track.kind === Track.Kind.Audio) {
                        const detachedElements = track.detach();
                        detachedElements.forEach((el) => {
                            el.remove();
                            audioElementsRef.current = audioElementsRef.current.filter(
                                (a) => a !== el
                            );
                        });
                        setAgentSpeaking(false);
                    }
                }
            );

            // Listen for participant connection (AI agent joining)
            newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
                console.log(`Participant joined: ${participant.identity}`);
                setStatusText("AI Agent connected - Speak now");
            });

            newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
                console.log(`Participant left: ${participant.identity}`);
                setAgentSpeaking(false);
            });

            newRoom.on(RoomEvent.Disconnected, () => {
                console.log("Disconnected from room");
                setConnected(false);
                setStatusText("Disconnected");
                saveCallLog();
            });

            // Connect to LiveKit room using URL from backend response
            const livekitUrl = data.livekit_url || "wss://innvox-um8kvrmw.livekit.cloud";
            await newRoom.connect(livekitUrl, data.token);

            console.log("Connected to LiveKit room:", data.room);

            // Enable microphone
            await newRoom.localParticipant.setMicrophoneEnabled(true);

            setRoom(newRoom);
            setConnected(true);
            setStatusText("Connected - Waiting for AI Agent...");

            // Check if agent is already in the room
            const remoteParticipants = Array.from(newRoom.remoteParticipants.values());
            if (remoteParticipants.length > 0) {
                setStatusText("AI Agent connected - Speak now");
                // Subscribe to existing tracks
                remoteParticipants.forEach((participant: RemoteParticipant) => {
                    participant.trackPublications.forEach((pub: RemoteTrackPublication) => {
                        if (pub.track && pub.track.kind === Track.Kind.Audio) {
                            const audioElement = pub.track.attach();
                            audioElement.autoplay = true;
                            audioElement.volume = 1.0;
                            document.body.appendChild(audioElement);
                            audioElementsRef.current.push(audioElement);
                            setAgentSpeaking(true);
                        }
                    });
                });
            }

        } catch (err) {
            console.error("Call error:", err);
            alert("Error starting call. Please check if the AI Agent is running.");
            setStatusText("Connection failed");
        } finally {
            setIsConnecting(false);
        }
    };

    const saveCallLog = async () => {
        if (!startTimeRef.current) return;
        const endTime = new Date();
        const durationSeconds = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
        
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:8000/call/log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    contact_id: activeContactId,
                    status: "completed",
                    transcript: "AI: Hello, how can I help you today?\nUser: ...", // Placeholder for actual transcript
                    duration: durationSeconds
                })
            });
            console.log("Call logged successfully.");
        } catch (error) {
            console.error("Failed to log call:", error);
        }
    };

    const toggleMute = async () => {
        if (room) {
            const newMuted = !isMuted;
            await room.localParticipant.setMicrophoneEnabled(!newMuted);
            setIsMuted(newMuted);
        }
    };

    const endCall = () => {
        if (room) {
            room.disconnect();
        } else {
            // If ended before connecting fully or just resetting
            saveCallLog();
        }
        // Cleanup audio elements
        audioElementsRef.current.forEach((el) => {
            el.pause();
            el.remove();
        });
        audioElementsRef.current = [];
        setConnected(false);
        setRoom(null);
        setAgentSpeaking(false);
        setIsMuted(false);
        setStatusText("Ready to connect");
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100">

            <div className="relative mb-12 mt-8">
                {/* Status Ring */}
                <div className={`absolute -inset-8 rounded-full opacity-20 blur-xl transition-all duration-1000 ${connected
                    ? agentSpeaking
                        ? "bg-violet-500 animate-pulse"
                        : "bg-emerald-500 animate-pulse-slow"
                    : isConnecting
                        ? "bg-amber-500 animate-pulse"
                        : "bg-indigo-500"
                    }`}></div>

                {/* Main Avatar / Icon */}
                <div className="relative w-32 h-32 rounded-full bg-white shadow-xl shadow-slate-200/50 border-4 border-white flex items-center justify-center overflow-hidden z-10">
                    {connected ? (
                        <div className={`flex items-center justify-center w-full h-full ${agentSpeaking ? "bg-violet-50 text-violet-500" : "bg-emerald-50 text-emerald-500"}`}>
                            {agentSpeaking ? (
                                <Volume2 className="w-12 h-12 animate-pulse" strokeWidth={1.5} />
                            ) : (
                                <Activity className="w-12 h-12 animate-pulse" strokeWidth={1.5} />
                            )}
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
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Voice Agent</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="relative flex h-2.5 w-2.5">
                        {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    </span>
                    <p className="text-slate-500 font-medium text-sm">
                        {statusText}
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                {!connected ? (
                    <button
                        onClick={startCall}
                        disabled={isConnecting}
                        id="start-call-btn"
                        className={`flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all ${isConnecting ? "opacity-70 cursor-not-allowed scale-95" : "hover:scale-105 active:scale-95"
                            }`}
                    >
                        <Phone className="w-5 h-5" fill="currentColor" stroke="none" />
                        {isConnecting ? "Initiating Call..." : "Start Voice Call"}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={toggleMute}
                            id="mute-btn"
                            className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors ${isMuted
                                ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={endCall}
                            id="end-call-btn"
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