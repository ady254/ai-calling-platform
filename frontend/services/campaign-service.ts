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