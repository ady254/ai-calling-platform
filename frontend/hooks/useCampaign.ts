import { createCampaign } from "@/services/campaign-service";

export const useCampaign = () => {
    const create = async (data: any) => {
        try {
            const res = await createCampaign(data);
            return res.data;
        } catch (err) {
            console.error(err);
        }
    };

    return { create };
};