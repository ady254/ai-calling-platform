import { api } from "./api";

export const createCampaign = async (data: any) => {
    return api.post("/campaigns", data);
};