"use client";

import { useState } from "react";
import {
    Link2, Phone, Database, CheckCircle, Clock,
    AlertTriangle, XCircle, Loader2, RefreshCw, Shield, Wifi
} from "lucide-react";
import { api } from "@/services/api";

interface TwilioStatus {
    status: "connected" | "missing" | "invalid";
    message: string;
    account_name?: string;
    account_status?: string;
    phone_number?: string;
    account_sid_preview?: string;
    error?: string;
}

export default function IntegrationsPage() {
    const [twilioStatus, setTwilioStatus] = useState<TwilioStatus | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkTwilio = async () => {
        setIsChecking(true);
        setTwilioStatus(null);
        try {
            const res = await api.get("/call/twilio/status");
            setTwilioStatus(res.data);
        } catch (err: any) {
            setTwilioStatus({
                status: "invalid",
                message: "Could not reach the backend server. Is it running?",
                error: err.message,
            });
        } finally {
            setIsChecking(false);
        }
    };

    const integrations = [
        {
            name: "HubSpot CRM",
            description: "Automatically sync call logs, transcripts, and lead statuses to your HubSpot contacts.",
            icon: Database,
            status: "coming_soon" as const,
            color: "text-orange-500",
            bg: "bg-orange-50",
            gradient: "from-orange-500/10 to-amber-500/10",
        },
        {
            name: "Salesforce CRM",
            description: "Native integration to log AI activities and trigger workflows within Salesforce.",
            icon: Link2,
            status: "coming_soon" as const,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            gradient: "from-indigo-500/10 to-purple-500/10",
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "connected": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case "missing": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "invalid": return <XCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "connected":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold tracking-wide uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> Connected
                    </span>
                );
            case "missing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold tracking-wide uppercase">
                        <AlertTriangle className="w-3.5 h-3.5" /> Not Configured
                    </span>
                );
            case "invalid":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold tracking-wide uppercase">
                        <XCircle className="w-3.5 h-3.5" /> Error
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold tracking-wide uppercase">
                        <Clock className="w-3.5 h-3.5" /> Unchecked
                    </span>
                );
        }
    };

    return (
        <div className="w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Integrations</h1>
                <p className="text-slate-500 mt-2">Connect V3 AI Platform with your favorite tools.</p>
            </header>

            {/* ── Twilio Hero Card ── */}
            <div className="mb-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-[0_20px_60px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <Phone className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Twilio Telephony</h2>
                                <p className="text-blue-200 text-sm mt-0.5">Voice calls via PSTN network</p>
                            </div>
                        </div>
                        {twilioStatus ? getStatusBadge(twilioStatus.status) : getStatusBadge("unchecked")}
                    </div>

                    <p className="text-blue-100 leading-relaxed max-w-2xl mb-8">
                        Connect your AI agent directly to real phone numbers for outbound and inbound calls. 
                        Twilio handles the telephony layer while your AI agent manages the conversation.
                    </p>

                    {/* Action row */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={checkTwilio}
                            disabled={isChecking}
                            id="check-twilio-btn"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Wifi className="w-4 h-4" />
                                    Check Connection
                                </>
                            )}
                        </button>
                        {twilioStatus && (
                            <button
                                onClick={checkTwilio}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                title="Re-check"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Twilio Status Detail Panel ── */}
            {twilioStatus && (
                <div className={`mb-8 rounded-2xl border-2 p-6 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    twilioStatus.status === "connected"
                        ? "border-emerald-200 bg-emerald-50/50"
                        : twilioStatus.status === "missing"
                        ? "border-amber-200 bg-amber-50/50"
                        : "border-red-200 bg-red-50/50"
                }`}>
                    <div className="flex items-start gap-4">
                        <div className={`mt-0.5 p-2 rounded-xl ${
                            twilioStatus.status === "connected" ? "bg-emerald-100" :
                            twilioStatus.status === "missing" ? "bg-amber-100" : "bg-red-100"
                        }`}>
                            {getStatusIcon(twilioStatus.status)}
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold ${
                                twilioStatus.status === "connected" ? "text-emerald-800" :
                                twilioStatus.status === "missing" ? "text-amber-800" : "text-red-800"
                            }`}>
                                {twilioStatus.status === "connected" ? "Connection Successful" :
                                 twilioStatus.status === "missing" ? "Credentials Not Found" :
                                 "Connection Failed"}
                            </h3>
                            <p className={`text-sm mt-1 ${
                                twilioStatus.status === "connected" ? "text-emerald-700" :
                                twilioStatus.status === "missing" ? "text-amber-700" : "text-red-700"
                            }`}>
                                {twilioStatus.message}
                            </p>

                            {/* Details grid */}
                            {twilioStatus.status === "connected" && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <DetailCard
                                        icon={<Shield className="w-4 h-4 text-emerald-600" />}
                                        label="Account"
                                        value={twilioStatus.account_name || "—"}
                                    />
                                    <DetailCard
                                        icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
                                        label="Account Status"
                                        value={twilioStatus.account_status || "—"}
                                    />
                                    <DetailCard
                                        icon={<Phone className="w-4 h-4 text-emerald-600" />}
                                        label="Phone Number"
                                        value={twilioStatus.phone_number || "—"}
                                    />
                                </div>
                            )}

                            {twilioStatus.account_sid_preview && (
                                <p className="mt-3 text-xs font-mono opacity-60">
                                    SID: {twilioStatus.account_sid_preview}
                                </p>
                            )}

                            {twilioStatus.error && (
                                <details className="mt-3">
                                    <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                                        Show raw error
                                    </summary>
                                    <pre className="mt-2 text-xs bg-red-100 rounded-lg p-3 overflow-x-auto text-red-800 font-mono">
                                        {twilioStatus.error}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Other Integrations Grid ── */}
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Other Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:scale-[1.02] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${integration.bg} flex items-center justify-center`}>
                                <integration.icon className={`w-7 h-7 ${integration.color}`} />
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold tracking-wide uppercase">
                                <Clock className="w-3.5 h-3.5" /> Coming Soon
                            </span>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{integration.name}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                {integration.description}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button disabled className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">
                                Join Waitlist
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white rounded-xl border border-emerald-200 p-4 flex items-start gap-3">
            <div className="mt-0.5">{icon}</div>
            <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">{value}</div>
            </div>
        </div>
    );
}
