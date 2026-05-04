export type CampaignStatus = "draft" | "scheduled" | "active" | "paused" | "completed" | "cancelled";

export interface Campaign {
    id: string;
    business_id: string;
    name: string;
    description?: string;
    objective?: string;
    language: string;
    status: CampaignStatus;
    ai_prompt?: string;
    ai_voice: string;
    max_retries: number;
    scheduled_at?: string;
    created_at: string;
    updated_at: string;
    contact_count: number;
}

export interface CampaignCreate {
    business_id: string;
    name: string;
    description?: string;
    objective?: string;
    language?: string;
    ai_prompt?: string;
    ai_voice?: string;
    max_retries?: number;
    scheduled_at?: string;
    contact_ids?: string[];
}