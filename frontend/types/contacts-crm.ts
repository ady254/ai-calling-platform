// Prop-driven data contracts for the AI-powered CRM Contacts page.
// Components consume these shapes only — the page can later swap mock data
// for backend records without touching presentation code.

export type CRMStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'qualified'
  | 'booked'
  | 'won'
  | 'lost';

export type CRMSentiment = 'Positive' | 'Neutral' | 'Negative';

export interface ContactNote {
  id: string;
  text: string;
  time: string; // e.g. "2 days ago"
}

export interface CRMContact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  leadScore: number; // 0-100
  status: CRMStatus;
  lastContact: string | null; // ISO string, null if never contacted
  assignedAgent: string;
  nextAction: string;
  tags: string[];
  // Drawer detail fields
  assignedCampaign: string;
  lastCallSummary: string;
  sentiment: CRMSentiment;
  nextFollowUp: string;
  notes: ContactNote[];
  conversionProbability: number; // 0-100
  aiRecommendations: string[];
}

export type ContactKPIIcon =
  | 'total'
  | 'qualified'
  | 'followups'
  | 'appointments'
  | 'customers'
  | 'score';

export interface ContactKPI {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon: ContactKPIIcon;
}

export interface PipelineStage {
  id: CRMStatus;
  label: string;
  count: number;
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface ContactFilterConfig {
  statuses: FilterOption[];
  scoreRanges: FilterOption[]; // ids like "0-25"
  industries: FilterOption[];
  tags: FilterOption[];
  lastContacted: FilterOption[]; // ids: today | yesterday | 7d | 30d
}

export interface ContactFilters {
  statuses: string[];
  scoreRanges: string[];
  industries: string[];
  tags: string[];
  lastContacted: string | null;
  search: string;
}

export const EMPTY_FILTERS: ContactFilters = {
  statuses: [],
  scoreRanges: [],
  industries: [],
  tags: [],
  lastContacted: null,
  search: '',
};

export interface ContactsData {
  contacts: CRMContact[];
  kpis: ContactKPI[];
  pipeline: PipelineStage[];
  filterConfig: ContactFilterConfig;
}
