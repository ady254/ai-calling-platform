"use client";

import { useState, useEffect, useCallback } from "react";
import { useCampaigns } from "@/hooks/useCampaign";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Play, Plus, Trash2, Users, Pause, Square,
    Loader2, CheckCircle, XCircle, Clock, PhoneCall
} from "lucide-react";
import Link from "next/link";
import {
    startCampaign, pauseCampaign, stopCampaign,
    getCampaignProgress, CampaignProgress
} from "@/services/campaign-service";

export default function CampaignsPage() {
    const { campaigns, loading, error, removeCampaign, refresh } = useCampaigns();
    const [progressMap, setProgressMap] = useState<Record<string, CampaignProgress>>({});
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    // Poll progress for active/running campaigns
    const pollProgress = useCallback(async () => {
        const activeCampaigns = campaigns.filter(
            c => ["active", "scheduled"].includes(c.status)
        );

        for (const campaign of activeCampaigns) {
            try {
                const res = await getCampaignProgress(campaign.id);
                setProgressMap(prev => ({ ...prev, [campaign.id]: res.data }));
            } catch { }
        }
    }, [campaigns]);

    useEffect(() => {
        pollProgress();
        const interval = setInterval(pollProgress, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [pollProgress]);

    const handleStart = async (campaignId: string) => {
        setActionLoading(prev => ({ ...prev, [campaignId]: true }));
        try {
            await startCampaign(campaignId);
            await refresh();
            // Start polling progress immediately
            setTimeout(async () => {
                try {
                    const res = await getCampaignProgress(campaignId);
                    setProgressMap(prev => ({ ...prev, [campaignId]: res.data }));
                } catch { }
            }, 1000);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to start campaign");
        } finally {
            setActionLoading(prev => ({ ...prev, [campaignId]: false }));
        }
    };

    const handlePause = async (campaignId: string) => {
        setActionLoading(prev => ({ ...prev, [campaignId]: true }));
        try {
            await pauseCampaign(campaignId);
            await refresh();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to pause campaign");
        } finally {
            setActionLoading(prev => ({ ...prev, [campaignId]: false }));
        }
    };

    const handleStop = async (campaignId: string) => {
        if (!confirm("Are you sure you want to stop this campaign? This cannot be undone.")) return;
        setActionLoading(prev => ({ ...prev, [campaignId]: true }));
        try {
            await stopCampaign(campaignId);
            await refresh();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to stop campaign");
        } finally {
            setActionLoading(prev => ({ ...prev, [campaignId]: false }));
        }
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading campaigns...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "active": return { color: "bg-emerald-100 text-emerald-700", icon: PhoneCall, pulse: true };
            case "scheduled": return { color: "bg-blue-100 text-blue-700", icon: Clock, pulse: false };
            case "completed": return { color: "bg-slate-100 text-slate-600", icon: CheckCircle, pulse: false };
            case "paused": return { color: "bg-amber-100 text-amber-700", icon: Pause, pulse: false };
            case "cancelled": return { color: "bg-red-100 text-red-700", icon: XCircle, pulse: false };
            default: return { color: "bg-slate-100 text-slate-700", icon: Clock, pulse: false };
        }
    };

    return (
        <div className="w-full">
            <header className="mb-10 w-full flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Campaigns</h1>
                    <p className="text-slate-500 mt-2">Manage your AI calling campaigns and monitor their status.</p>
                </div>
                <Link href="/dashboard/campaigns/create">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Campaign
                    </Button>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {campaigns.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">
                        No campaigns found. Create your first campaign to get started.
                    </div>
                ) : (
                    campaigns.map((campaign) => {
                        const statusConfig = getStatusConfig(campaign.status);
                        const StatusIcon = statusConfig.icon;
                        const progress = progressMap[campaign.id];
                        const isLoading = actionLoading[campaign.id];
                        const isActive = campaign.status === "active";
                        const isDraft = campaign.status === "draft";
                        const isPaused = campaign.status === "paused";
                        const isFinished = ["completed", "cancelled"].includes(campaign.status);

                        return (
                            <Card key={campaign.id} className="flex flex-col h-full relative overflow-hidden">
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse" />
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-slate-800 truncate pr-4">{campaign.name}</h3>
                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusConfig.color} ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {campaign.status}
                                    </span>
                                </div>

                                {campaign.description && (
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{campaign.description}</p>
                                )}

                                {/* Progress Bar (when active or has progress data) */}
                                {progress && progress.total_contacts > 0 && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                            <span>{progress.completed + progress.failed} / {progress.total_contacts} processed</span>
                                            <span className="font-semibold text-slate-700">{progress.progress_percent}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                                                style={{ width: `${progress.progress_percent}%` }}
                                            />
                                        </div>
                                        <div className="flex gap-3 mt-2 text-[10px] font-medium text-slate-400">
                                            {progress.completed > 0 && (
                                                <span className="flex items-center gap-0.5">
                                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                    {progress.completed} done
                                                </span>
                                            )}
                                            {progress.failed > 0 && (
                                                <span className="flex items-center gap-0.5">
                                                    <XCircle className="w-3 h-3 text-red-500" />
                                                    {progress.failed} failed
                                                </span>
                                            )}
                                            {progress.calling > 0 && (
                                                <span className="flex items-center gap-0.5 text-emerald-600 animate-pulse">
                                                    <PhoneCall className="w-3 h-3" />
                                                    {progress.calling} calling
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-indigo-500" />
                                            <span className="font-medium">{campaign.contact_count || 0} Contacts</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Start / Resume button */}
                                        {(isDraft || isPaused) && (
                                            <Button
                                                variant="secondary"
                                                className="flex-1 gap-2 text-sm py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                                onClick={() => handleStart(campaign.id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Play className="w-4 h-4" />
                                                )}
                                                {isPaused ? "Resume" : "Start"}
                                            </Button>
                                        )}

                                        {/* Pause button */}
                                        {isActive && (
                                            <Button
                                                variant="secondary"
                                                className="flex-1 gap-2 text-sm py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                                onClick={() => handlePause(campaign.id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Pause className="w-4 h-4" />
                                                )}
                                                Pause
                                            </Button>
                                        )}

                                        {/* Stop button (for active or paused) */}
                                        {(isActive || isPaused) && (
                                            <Button
                                                variant="outline"
                                                className="px-3 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={() => handleStop(campaign.id)}
                                                disabled={isLoading}
                                                title="Stop campaign"
                                            >
                                                <Square className="w-4 h-4" />
                                            </Button>
                                        )}

                                        {/* Delete button (only for draft, completed, cancelled) */}
                                        {(isDraft || isFinished) && (
                                            <Button
                                                variant="outline"
                                                className="px-3 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={() => {
                                                    if (confirm("Are you sure you want to delete this campaign?")) {
                                                        removeCampaign(campaign.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
