import { useState, useEffect } from "react";
import { getCampaigns, createCampaign, deleteCampaign } from "@/services/campaign-service";
import { Campaign, CampaignCreate } from "@/types/campaign";

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await getCampaigns();
            setCampaigns(res.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to fetch campaigns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const addCampaign = async (data: CampaignCreate) => {
        try {
            const res = await createCampaign(data);
            setCampaigns((prev) => [res.data, ...prev]);
            return res.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.detail || "Failed to create campaign");
        }
    };

    const removeCampaign = async (id: string) => {
        try {
            await deleteCampaign(id);
            setCampaigns((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            throw new Error("Failed to delete campaign");
        }
    };

    return { campaigns, loading, error, addCampaign, removeCampaign, refresh: fetchCampaigns };
};