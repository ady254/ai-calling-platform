"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, CheckCircle, XCircle, RefreshCw, Sparkles } from "lucide-react";
import { api } from "@/services/api";

interface CallLog {
    id: string;
    contact_id: string;
    status: string;
    transcript: string | null;
    duration: number;
    created_at: string;
    outcome: string | null;
    summary: string | null;
    follow_up: string | null;
}

const OUTCOME_STYLES: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-600",
    rescheduled: "bg-amber-50 text-amber-600",
    callback_requested: "bg-sky-50 text-sky-600",
    not_interested: "bg-slate-100 text-slate-500",
    do_not_call: "bg-rose-50 text-rose-600",
    wrong_person: "bg-violet-50 text-violet-600",
    incomplete: "bg-slate-100 text-slate-500",
    other: "bg-slate-100 text-slate-500",
};

function outcomeLabel(outcome: string): string {
    return outcome
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export default function CallLogsPage() {
    const [logs, setLogs] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.get<CallLog[]>("/call/logs");
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch logs", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="w-full">
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Call History</h1>
                    <p className="text-slate-500 mt-2">View logs, outcomes and transcripts of all past AI calls.</p>
                </div>
                <Link
                    href="/dashboard/call-logs/sample"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all self-start sm:self-auto"
                >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    View Sample Intelligence
                </Link>
            </header>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Outcome</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 animate-pulse">Loading calls...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    <p className="text-slate-500 mb-3">Couldn&apos;t load call logs. Check your connection and try again.</p>
                                    <button
                                        onClick={fetchLogs}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Retry
                                    </button>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center">
                                    <p className="text-slate-400 mb-3">No call logs found.</p>
                                    <Link
                                        href="/dashboard/call-logs/sample"
                                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition-colors"
                                    >
                                        <Sparkles className="w-4 h-4" /> Preview sample call intelligence
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6 text-sm text-slate-700 font-medium">
                                        {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                                    </td>
                                    <td className="py-4 px-6">
                                        {log.status === "completed" ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                                                <CheckCircle className="w-3 h-3" /> Completed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">
                                                <XCircle className="w-3 h-3" /> {log.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        {log.outcome ? (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${OUTCOME_STYLES[log.outcome] || OUTCOME_STYLES.other}`}>
                                                {outcomeLabel(log.outcome)}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600">{log.duration}s</td>
                                    <td className="py-4 px-6">
                                        <Link
                                            href={`/dashboard/call-logs/${log.id}`}
                                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                                        >
                                            <FileText className="w-4 h-4" /> View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
