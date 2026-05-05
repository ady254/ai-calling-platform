"use client";

import { useEffect, useState } from "react";
import { Phone, CheckCircle, XCircle, Clock } from "lucide-react";

interface AnalyticsData {
    total_calls: number;
    completed_calls: number;
    failed_calls: number;
    average_duration_seconds: number;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/call/analytics", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch analytics");
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading analytics...</div>;
    if (error) return <div className="p-8 text-rose-500">Error: {error}</div>;

    const cards = [
        { title: "Total Calls", value: data?.total_calls || 0, icon: Phone, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Completed Calls", value: data?.completed_calls || 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        { title: "Failed Calls", value: data?.failed_calls || 0, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
        { title: "Avg Duration", value: `${Math.round(data?.average_duration_seconds || 0)}s`, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
    ];

    return (
        <div className="w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Analytics Dashboard</h1>
                <p className="text-slate-500 mt-2">Overview of your AI agent's calling performance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center`}>
                            <card.icon className={`w-7 h-7 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">{card.title}</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-1">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">Call Performance Trends</h3>
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <ActivityIcon className="w-10 h-10 mb-3 opacity-50" />
                    <p>More detailed charts coming soon</p>
                </div>
            </div>
        </div>
    );
}

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
