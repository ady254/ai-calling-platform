export interface Agent {
    id: string;
    business_id: string;
    name: string;
    description?: string;
    system_prompt: string;
    language: string;
    voice_id: string;
    stability: number;
    similarity_boost: number;
    created_at: string;
    updated_at: string;
}

export interface AgentCreate {
    business_id?: string;
    name: string;
    description?: string;
    system_prompt: string;
    language?: string;
    voice_id?: string;
    stability?: number;
    similarity_boost?: number;
}

export interface AgentUpdate {
    name?: string;
    description?: string;
    system_prompt?: string;
    language?: string;
    voice_id?: string;
    stability?: number;
    similarity_boost?: number;
}
