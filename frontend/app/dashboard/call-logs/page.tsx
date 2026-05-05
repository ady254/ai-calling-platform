"use client";

import { useEffect, useState } from "react";
import { PhoneCall, FileText, CheckCircle, XCircle } from "lucide-react";

interface CallLog {
    id: string;
    contact_id: string;
    status: string;
    transcript: string | null;
    duration: number;
    created_at: string;
}

export default function CallLogsPage() {
    const [logs, setLogs] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:8000/call/logs", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (err) {
                console.error("Failed to fetch logs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Call History</h1>
                <p className="text-slate-500 mt-2">View logs and transcripts of all past AI calls.</p>
            </header>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                            <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transcript</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400 animate-pulse">Loading calls...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-400">No call logs found.</td>
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
                                    <td className="py-4 px-6 text-sm text-slate-600">{log.duration}s</td>
                                    <td className="py-4 px-6">
                                        <button 
                                            onClick={() => setSelectedTranscript(log.transcript || "No transcript available")}
                                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                                        >
                                            <FileText className="w-4 h-4" /> View Transcript
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Transcript Modal */}
            {selectedTranscript !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Call Transcript
                            </h3>
                            <button onClick={() => setSelectedTranscript(null)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                            <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                                {selectedTranscript}
                            </pre>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                            <button onClick={() => setSelectedTranscript(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
