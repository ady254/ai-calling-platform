"use client";

import { Link2, Phone, Database, CheckCircle, Clock } from "lucide-react";

export default function IntegrationsPage() {
    const integrations = [
        {
            name: "Twilio Telephony",
            description: "Connect your AI agent directly to real phone numbers (PSTN) for outbound and inbound calls.",
            icon: Phone,
            status: "active",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            name: "HubSpot CRM",
            description: "Automatically sync call logs, transcripts, and lead statuses to your HubSpot contacts.",
            icon: Database,
            status: "coming_soon",
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            name: "Salesforce CRM",
            description: "Native integration to log AI activities and trigger workflows within Salesforce.",
            icon: Link2,
            status: "coming_soon",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        }
    ];

    return (
        <div className="w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">Integrations</h1>
                <p className="text-slate-500 mt-2">Connect V3 AI Platform with your favorite tools.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform hover:scale-[1.02] flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${integration.bg} flex items-center justify-center`}>
                                <integration.icon className={`w-7 h-7 ${integration.color}`} />
                            </div>
                            {integration.status === "active" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold tracking-wide uppercase">
                                    <CheckCircle className="w-3.5 h-3.5" /> Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold tracking-wide uppercase">
                                    <Clock className="w-3.5 h-3.5" /> Coming Soon
                                </span>
                            )}
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{integration.name}</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                {integration.description}
                            </p>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            {integration.status === "active" ? (
                                <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                                    Configure
                                </button>
                            ) : (
                                <button disabled className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">
                                    Join Waitlist
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
