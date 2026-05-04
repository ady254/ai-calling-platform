"use client";

import { useCampaigns } from "@/hooks/useCampaign";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
    const { campaigns, loading, error, removeCampaign } = useCampaigns();

    if (loading) return <div className="p-8">Loading campaigns...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-700";
            case "scheduled": return "bg-blue-100 text-blue-700";
            case "completed": return "bg-gray-100 text-gray-700";
            case "paused": return "bg-yellow-100 text-yellow-700";
            default: return "bg-slate-100 text-slate-700";
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
                    campaigns.map((campaign) => (
                        <Card key={campaign.id} className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-800 truncate pr-4">{campaign.name}</h3>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(campaign.status)}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            
                            {campaign.description && (
                                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{campaign.description}</p>
                            )}

                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        <span className="font-medium">{campaign.contact_count || 0} Contacts</span>
                                    </div>
                                    <div>{new Date(campaign.created_at).toLocaleDateString()}</div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="flex-1 gap-2 text-sm py-2">
                                        <Play className="w-4 h-4" />
                                        Start
                                    </Button>
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
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
