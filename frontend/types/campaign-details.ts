// Prop-driven data contracts for the Campaign Details page.
// Every component consumes one of these shapes so the page can be wired
// to the backend later without touching presentation code.

export type CampaignRunStatus =
  | 'running'
  | 'paused'
  | 'scheduled'
  | 'completed'
  | 'draft'
  | 'cancelled';

export interface CampaignHeaderData {
  name: string;
  status: CampaignRunStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type CampaignKPIIcon =
  | 'calls-completed'
  | 'in-progress'
  | 'qualified'
  | 'appointments'
  | 'conversion'
  | 'pipeline';

export interface CampaignKPI {
  id: string;
  title: string;
  value: string | number;
  subLabel?: string; // e.g. "+12 today", "Currently active", "Lead Score >75"
  changeType?: 'positive' | 'neutral' | 'negative';
  icon: CampaignKPIIcon;
  isHero?: boolean;
}

export interface CampaignProgressData {
  completed: number;
  total: number;
  etaLabel: string; // e.g. "2h 14m remaining"
  retryQueue: number;
  failedCalls: number;
  successRate: number; // percent, e.g. 81
}

export interface CampaignChartPoint {
  date: string;
  calls: number;
  conversions: number;
  appointments: number;
  revenue: number;
}

export interface CampaignTimelineItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'neutral';
  title: string;
  time: string; // e.g. "2 min ago"
}

export interface CampaignInsightItem {
  id: string;
  text: string;
}

export interface CampaignFunnelStage {
  id: string;
  label: string;
  value: number;
}

export type CallOutcome =
  | 'Qualified'
  | 'Appointment'
  | 'Callback'
  | 'Not Interested'
  | 'Voicemail'
  | 'No Answer';

export type CallSentiment = 'Positive' | 'Neutral' | 'Negative';

export interface RecentCall {
  id: string;
  customer: string;
  duration: string; // e.g. "2m 18s"
  outcome: CallOutcome;
  leadScore: number; // 0 - 100
  sentiment: CallSentiment;
  nextAction: string;
}

export interface CampaignSettingsData {
  voice: string;
  language: string;
  retries: string;
  knowledgeBase: string;
  promptVersion: string;
  launchSchedule: string;
  timezone: string;
}

export interface ExecutiveSummaryData {
  title: string;
  body: string;
  footer: string;
}

export interface CampaignDetailData {
  header: CampaignHeaderData;
  kpis: CampaignKPI[];
  progress: CampaignProgressData;
  chart: CampaignChartPoint[];
  timeline: CampaignTimelineItem[];
  insights: CampaignInsightItem[];
  funnel: CampaignFunnelStage[];
  recentCalls: RecentCall[];
  settings: CampaignSettingsData;
  summary: ExecutiveSummaryData;
}
