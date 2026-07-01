import { api } from "./api";
import { Business, BusinessUpdate } from "@/types/business";

export const getBusiness = async () => {
    return api.get<Business>("/business/me");
};

export const updateBusiness = async (data: BusinessUpdate) => {
    return api.put<Business>("/business/me", data);
};
