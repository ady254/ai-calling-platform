import { api } from "./api";
import { CRMContact, ContactKPI, PipelineStage } from "@/types/contacts-crm";

// Read path for the AI CRM. Endpoints return shapes that already match the
// frontend types (see backend app/api/contact_routes.py). Callers should
// treat failures as "backend not ready" and fall back to mock data.

export const getCRMContacts = async (): Promise<CRMContact[]> => {
  const res = await api.get<CRMContact[]>("/contact/crm");
  return res.data;
};

export const getContactKPIs = async (): Promise<ContactKPI[]> => {
  const res = await api.get<ContactKPI[]>("/contact/kpis");
  return res.data;
};

export const getContactPipeline = async (): Promise<PipelineStage[]> => {
  const res = await api.get<PipelineStage[]>("/contact/pipeline");
  return res.data;
};

export interface CreateContactPayload {
  name: string;
  phone_number: string;
  email?: string;
  company?: string;
  tags?: string;
  industry?: string;
  lead_score?: number;
  pipeline_stage?: string;
}

// Best-effort persistence — the page adds the contact locally regardless.
export const createContactApi = async (payload: CreateContactPayload) => {
  const res = await api.post("/contact", payload);
  return res.data;
};
