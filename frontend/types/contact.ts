export type ContactStatus = "new" | "contacted" | "interested" | "not_interested" | "no_answer" | "callback" | "converted" | "do_not_call";

export interface Contact {
    id: string;
    business_id: string;
    name: string;
    phone_number: string;
    email?: string;
    company?: string;
    tags?: string;
    notes?: string;
    status: ContactStatus;
    created_at: string;
    updated_at: string;
}

export interface ContactCreate {
    business_id: string;
    name: string;
    phone_number: string;
    email?: string;
    company?: string;
    tags?: string;
    notes?: string;
}
