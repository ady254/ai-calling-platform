import { api } from "./api";

// Real Call Details from the backend. Returns the fields derivable from stored
// call data; AI-enriched sections stay client-side mock until enrichment runs.
export interface CallDetailResponse {
  header: {
    customerName: string;
    company: string;
    phone: string;
    campaign: string;
    status: string;
    durationLabel: string;
    date: string | null;
  };
  kpis: unknown[];
  intelligence: unknown[];
  recording: { url: string | null; durationSeconds: number } | null;
  summary: string[] | null;
  transcript: unknown[] | null;
}

export const getCallDetail = async (id: string) => {
  return api.get<CallDetailResponse>(`/call/logs/${id}`);
};
