export interface Business {
    id: string;
    name?: string;
    industry?: string;
    default_language?: string;
}

export interface BusinessUpdate {
    name?: string;
    industry?: string;
    default_language?: string;
}
