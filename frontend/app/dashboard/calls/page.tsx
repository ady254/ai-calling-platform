"use client";
import LiveCall from "@/components/dashboard/live-call";

export default function CallsPage() {
    return (
        <div className="w-full">
            <header className="mb-8 w-full flex flex-col">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Active Call Session</h1>
                <p className="text-slate-500 mt-2">Connect with the V3 agent directly from your dashboard.</p>
            </header>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 max-w-4xl">
                <LiveCall />
            </div>
        </div>
    );
}
