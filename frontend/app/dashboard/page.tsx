"use client";

import { useEffect, useState } from "react";
import {
    Phone, Users, Megaphone, TrendingUp,
    CheckCircle, XCircle, Clock, ArrowUpRight,
    Activity, Loader2
} from "lucide-react";
import { api } from "@/services/api";

interface AnalyticsData {
    total_calls: number;
    completed_calls: number;
    failed_calls: number;
    average_duration_seconds: number;
    active_campaigns: number;
    total_contacts: number;
    call_trends: { date: string; calls: number }[];
}

export default function Dashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/call/analytics");
                setData(res.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
                    <h3 className="font-semibold">Failed to load dashboard</h3>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const successRate = data && data.total_calls > 0
        ? ((data.completed_calls / data.total_calls) * 100).toFixed(1)
        : "0.0";

    const avgDuration = data ? Math.round(data.average_duration_seconds) : 0;
    const avgMin = Math.floor(avgDuration / 60);
    const avgSec = avgDuration % 60;
    const durationStr = avgMin > 0 ? `${avgMin}m ${avgSec}s` : `${avgSec}s`;

    // Simple sparkline from trends
    const maxCalls = data ? Math.max(...data.call_trends.map(t => t.calls), 1) : 1;

    return (
        <div className="w-full">
            <header className="mb-10 w-full flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-2">Welcome back! Here&apos;s what&apos;s happening with your AI campaigns today.</p>
                </div>
            </header>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                {/* Total Calls */}
                <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-blue-500" />
                        </div>
                        {data && data.total_calls > 0 && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                Live
                            </span>
                        )}
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Total Calls Made</h3>
                    <p className="text-4xl font-bold text-slate-800 mt-2 leading-none">
                        {data?.total_calls.toLocaleString() || "0"}
                    </p>
                </div>

                {/* Active Campaigns */}
                <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Megaphone className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Active Campaigns</h3>
                    <p className="text-4xl font-bold text-slate-800 mt-2 leading-none">
                        {data?.active_campaigns || 0}
                    </p>
                </div>

                {/* Total Contacts */}
                <div className="rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-violet-500" />
                        </div>
                    </div>
                    <h3 className="text-slate-500 font-medium text-sm">Total Contacts</h3>
                    <p className="text-4xl font-bold text-slate-800 mt-2 leading-none">
                        {data?.total_contacts.toLocaleString() || "0"}
                    </p>
                </div>

                {/* Success Rate */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 text-white hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-white/80 font-medium text-sm">Success Rate</h3>
                    <p className="text-4xl font-bold text-white mt-2 leading-none">
                        {successRate}%
                    </p>
                </div>
            </div>

            {/* ── Secondary Stats + Trend ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Call Breakdown
                    </h3>
                    <div className="space-y-4">
                        <StatRow
                            icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
                            label="Completed"
                            value={data?.completed_calls || 0}
                            color="bg-emerald-50 text-emerald-700"
                        />
                        <StatRow
                            icon={<XCircle className="w-4 h-4 text-rose-500" />}
                            label="Failed"
                            value={data?.failed_calls || 0}
                            color="bg-rose-50 text-rose-700"
                        />
                        <StatRow
                            icon={<Clock className="w-4 h-4 text-indigo-500" />}
                            label="Avg Duration"
                            value={durationStr}
                            color="bg-indigo-50 text-indigo-700"
                        />
                    </div>
                </div>

                {/* 7-Day Trend (Simple bar visualization) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-lg font-semibold text-slate-800 mb-5 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Call Volume (Last 7 Days)
                    </h3>
                    {data && data.call_trends.length > 0 ? (
                        <div className="flex items-end gap-3 h-40">
                            {data.call_trends.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">
                                        {day.calls}
                                    </span>
                                    <div
                                        className="w-full rounded-lg bg-gradient-to-t from-indigo-500 to-indigo-400 transition-all duration-500 min-h-[4px]"
                                        style={{
                                            height: `${Math.max((day.calls / maxCalls) * 100, 3)}%`
                                        }}
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {day.date.split(" ")[1]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm">No call data yet. Start a campaign to see trends.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatRow({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm text-slate-600 font-medium">{label}</span>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${color}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
        </div>
    );
}