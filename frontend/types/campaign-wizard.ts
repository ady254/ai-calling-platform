export interface WizardCampaignState {
    // Standard backend fields
    name: string;
    objective: string;
    description: string;
    agent_id: string;
    language: string;
    ai_voice: string;
    max_retries: number;
    ai_prompt: string;
    contact_ids: string[];

    // UI-only fields for presentation
    businessType: string;
    schedule: string;
    timezone: string;
    speakingStyle: string;
    knowledgeBase: string;
}

export const initialWizardState: WizardCampaignState = {
    name: "",
    objective: "",
    description: "",
    agent_id: "",
    language: "en",
    ai_voice: "qtqlHrXyBpEXHx2JBPgx",
    max_retries: 2,
    ai_prompt: "",
    contact_ids: [],
    
    // UI defaults
    businessType: "",
    schedule: "Immediately",
    timezone: "UTC",
    speakingStyle: "Professional",
    knowledgeBase: ""
};
