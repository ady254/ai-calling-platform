export type BusinessType =
    | "healthcare"
    | "gym"
    | "real_estate"
    | "education";

export interface Campaign {
    businessType: BusinessType;
    scenario: string;
    contacts: string[];
}