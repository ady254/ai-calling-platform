"use client";

import { useEffect, useRef, useState } from "react";
import { Phone, RotateCcw, ClipboardCheck, HeartPulse, Building } from "lucide-react";

interface DemoMessage {
    from: "agent" | "user";
    text: string;
}

interface DemoScenario {
    label: string;
    icon: React.ReactNode;
    callerName: string;
    businessName: string;
    messages: DemoMessage[];
    outcome: { label: string; style: string };
    summary: string;
    followUp: string;
}

const SCENARIOS: Record<string, DemoScenario> = {
    hospital: {
        label: "Hospital",
        icon: <HeartPulse className="w-4 h-4" />,
        callerName: "Adnan",
        businessName: "Holy Family Hospital",
        messages: [
            { from: "agent", text: "Hi Adnan, this is Aria calling from Holy Family Hospital about your appointment." },
            { from: "user", text: "Hello, yes?" },
            { from: "agent", text: "You have an appointment with Dr. Sharma tomorrow at 6 PM. Will you be able to make it?" },
            { from: "user", text: "Actually, can we reschedule to Saturday, 8 PM?" },
            { from: "agent", text: "Sure — Saturday at 8 PM. A staff member will confirm the new slot and call you back. Anything else?" },
            { from: "user", text: "Do I need to bring my medical reports?" },
            { from: "agent", text: "I'll have our staff answer that when they confirm your slot. Thank you, Adnan!" },
        ],
        outcome: { label: "Rescheduled", style: "bg-amber-50 text-amber-600" },
        summary: "Patient asked to move tomorrow's 6 PM appointment to Saturday 8 PM and asked whether medical reports are needed.",
        followUp: "Confirm the Saturday 8 PM slot with Dr. Sharma and answer the medical-reports question.",
    },
    realestate: {
        label: "Real Estate",
        icon: <Building className="w-4 h-4" />,
        callerName: "Priya",
        businessName: "Skyline Realty",
        messages: [
            { from: "agent", text: "Hi Priya, this is Neha from Skyline Realty — about the 2BHK in Andheri you enquired about." },
            { from: "user", text: "Oh yes, I was looking at that one." },
            { from: "agent", text: "Great! Are you looking to buy within the next three months?" },
            { from: "user", text: "Yes, but my budget is around 1.2 crore." },
            { from: "agent", text: "That fits — we have three options in that range. Would Saturday morning work for a site visit?" },
            { from: "user", text: "Saturday afternoon works better for me." },
            { from: "agent", text: "Perfect, I've noted Saturday 2 PM. Our agent will call you with the details. Thank you, Priya!" },
        ],
        outcome: { label: "Confirmed", style: "bg-emerald-50 text-emerald-600" },
        summary: "Lead is actively buying within 3 months with a ₹1.2 Cr budget. Site visit agreed for Saturday 2 PM.",
        followUp: "Assign an agent for the Saturday 2 PM site visit in Andheri and send property options in the ₹1.2 Cr range.",
    },
};

export default function LiveDemo() {
    const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>("hospital");
    const [step, setStep] = useState(0);
    const [showOutcome, setShowOutcome] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    const scenario = SCENARIOS[scenarioKey];
    const finished = step >= scenario.messages.length;

    useEffect(() => {
        if (!finished) {
            const next = scenario.messages[step];
            const delay = next.from === "agent" ? 2100 : 1300;
            const t = setTimeout(() => setStep(s => s + 1), delay);
            return () => clearTimeout(t);
        } else if (!showOutcome) {
            const t = setTimeout(() => setShowOutcome(true), 600);
            return () => clearTimeout(t);
        }
    }, [step, finished, showOutcome, scenario.messages]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [step]);

    const restart = (key: keyof typeof SCENARIOS) => {
        setScenarioKey(key);
        setStep(0);
        setShowOutcome(false);
    };

    const nextSender = !finished ? scenario.messages[step].from : null;

    return (
        <section id="live-demo" className="py-32 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/60 bg-white/50 backdrop-blur-md text-sm font-medium text-slate-800 mb-6 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Demo
                    </div>
                    <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-slate-900">
                        Hear how a call actually goes
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-2xl mx-auto">
                        A real conversation flow from our AI agent — and the structured outcome your team receives the moment the call ends.
                    </p>
                </div>

                {/* Scenario tabs */}
                <div className="flex justify-center gap-3 mb-10">
                    {(Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => restart(key)}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                                scenarioKey === key
                                    ? "bg-[#111] text-white shadow-lg"
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            {SCENARIOS[key].icon}
                            {SCENARIOS[key].label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Phone call panel */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="bg-[#111] text-white px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{scenario.businessName}</p>
                                    <p className="text-xs text-slate-400">AI Agent · Outbound Call</p>
                                </div>
                            </div>
                            <button
                                onClick={() => restart(scenarioKey)}
                                className="text-slate-400 hover:text-white transition-colors"
                                aria-label="Replay demo"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>

                        <div ref={chatRef} className="h-[380px] overflow-y-auto p-6 space-y-4 bg-slate-50/50 scroll-smooth">
                            {scenario.messages.slice(0, step).map((msg, i) => (
                                <div key={`${scenarioKey}-${i}`} className={`flex ${msg.from === "agent" ? "justify-start" : "justify-end"}`}>
                                    <div
                                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            msg.from === "agent"
                                                ? "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
                                                : "bg-indigo-500 text-white rounded-tr-sm"
                                        }`}
                                    >
                                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${msg.from === "agent" ? "text-indigo-500" : "text-indigo-100"}`}>
                                            {msg.from === "agent" ? "AI Agent" : scenario.callerName}
                                        </p>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* Speaking indicator */}
                            {nextSender && (
                                <div className={`flex ${nextSender === "agent" ? "justify-start" : "justify-end"}`}>
                                    <div className={`px-4 py-3 rounded-2xl flex items-center gap-1 ${nextSender === "agent" ? "bg-white border border-slate-100" : "bg-indigo-500/80"}`}>
                                        {[0, 1, 2, 3].map((i) => (
                                            <span
                                                key={i}
                                                className={`w-1 rounded-full animate-pulse ${nextSender === "agent" ? "bg-indigo-400" : "bg-white"}`}
                                                style={{ height: `${8 + (i % 2) * 6}px`, animationDelay: `${i * 150}ms` }}
                                            ></span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Outcome panel */}
                    <div className="lg:sticky lg:top-8">
                        <div className={`bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 transition-all duration-700 ${showOutcome ? "opacity-100 translate-y-0" : "opacity-40 translate-y-2"}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">Call Outcome</h3>
                                    <p className="text-xs text-slate-400">{showOutcome ? "Extracted automatically after the call" : "Waiting for call to finish..."}</p>
                                </div>
                            </div>

                            {showOutcome ? (
                                <div className="space-y-5 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outcome</span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${scenario.outcome.style}`}>
                                            {scenario.outcome.label}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Summary</span>
                                        <p className="text-sm text-slate-700 mt-1 leading-relaxed">{scenario.summary}</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Follow-up for your team</span>
                                        <p className="text-sm text-amber-800 mt-1 leading-relaxed">{scenario.followUp}</p>
                                    </div>
                                    <a
                                        href="/signup"
                                        className="inline-flex items-center gap-2 bg-[#111] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 mt-2"
                                    >
                                        Get this for your business
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-100 rounded-full w-1/3 animate-pulse"></div>
                                    <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                                    <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse"></div>
                                    <div className="h-20 bg-slate-50 rounded-xl w-full animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
