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

// Persist a new contact. Returns the created record (with its real backend id)
// so the CRM list stays in sync with the contacts the campaign builder loads.
export const createContactApi = async (
  payload: CreateContactPayload
): Promise<{ id: string } & Record<string, unknown>> => {
  const res = await api.post("/contact", payload);
  return res.data as { id: string } & Record<string, unknown>;
};

export const updateContactApi = async (id: string, payload: Partial<CreateContactPayload>) => {
  const res = await api.put(`/contact/${id}`, payload);
  return res.data;
};

export const deleteContactApi = async (id: string) => {
  return api.delete(`/contact/${id}`);
};

// Upload a CSV to the real bulk-import endpoint. Extra columns beyond
// name/phone_number/email/company/tags are preserved as per-contact variables
// (see backend contact_routes.py). Returns how many rows were imported.
export const importContactsApi = async (file: File): Promise<{ success: boolean; imported: number }> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/contact/import", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data as { success: boolean; imported: number };
};
