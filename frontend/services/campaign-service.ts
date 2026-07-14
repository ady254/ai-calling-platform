import { api } from "./api";
import { Campaign, CampaignCreate } from "@/types/campaign";

export const getCampaigns = async () => {
    return api.get<Campaign[]>("/campaign");
};

export const getCampaign = async (id: string) => {
    return api.get<Campaign>(`/campaign/${id}`);
};

export const createCampaign = async (data: CampaignCreate) => {
    return api.post<Campaign>("/campaign", data);
};

export const updateCampaign = async (id: string, data: Partial<CampaignCreate>) => {
    return api.put<Campaign>(`/campaign/${id}`, data);
};

export const deleteCampaign = async (id: string) => {
    return api.delete(`/campaign/${id}`);
};

export const addContactsToCampaign = async (campaignId: string, contactIds: string[]) => {
    return api.post(`/campaign/${campaignId}/contacts`, { contact_ids: contactIds });
};

// ── Campaign Execution ──

export const startCampaign = async (campaignId: string) => {
    return api.post(`/call/campaign/${campaignId}/start`);
};

export const pauseCampaign = async (campaignId: string) => {
    return api.post(`/call/campaign/${campaignId}/pause`);
};

export const stopCampaign = async (campaignId: string) => {
    return api.post(`/call/campaign/${campaignId}/stop`);
};

export interface CampaignProgress {
    campaign_id: string;
    campaign_status: string;
    is_running: boolean;
    total_contacts: number;
    pending: number;
    calling: number;
    completed: number;
    failed: number;
    skipped: number;
    progress_percent: number;
}

export const getCampaignProgress = async (campaignId: string) => {
    return api.get<CampaignProgress>(`/call/campaign/${campaignId}/progress`);
};

// Real per-campaign analytics for the Campaign Details page. Returns a partial
// of the CampaignDetailData shape (header, kpis, funnel, progress, recentCalls,
// timeline, settings) computed from call logs. See backend call_routes.py.
export interface CampaignAnalyticsResponse {
    header: { name: string; status: string; createdAt: string | null; updatedAt: string | null };
    kpis: unknown[];
    funnel: unknown[];
    progress: {
        completed: number;
        total: number;
        etaLabel: string;
        retryQueue: number;
        failedCalls: number;
        successRate: number;
    };
    recentCalls: unknown[];
    timeline: unknown[];
    settings: Record<string, string>;
}

export const getCampaignAnalytics = async (campaignId: string) => {
    return api.get<CampaignAnalyticsResponse>(`/call/campaign/${campaignId}/analytics`);
};