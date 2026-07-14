// Prop-driven contracts for the Executive Analytics dashboard. Every widget
// receives its data via props so the page can be wired to the backend later.

export type TrendDir = 'up' | 'down' | 'flat';

export type ExecKPIIcon = 'pipeline' | 'meetings' | 'leads' | 'conversion' | 'cost' | 'roi';

export interface ExecutiveKPI {
  id: string;
  label: string;
  value: string;
  change?: string; // e.g. "12%"
  trend?: TrendDir;
  positiveWhenUp?: boolean; // false for cost (down is good)
  icon: ExecKPIIcon;
  isHero?: boolean;
  heroSubtitle?: string; // e.g. "Revenue Generated / AI Cost"
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export type RevenueMetric = 'revenue' | 'pipeline' | 'meetings' | 'conversions' | 'cost' | 'roi';

export interface RevenuePoint {
  date: string;
  revenue: number;
  pipeline: number;
  meetings: number;
  conversions: number;
  cost: number;
  roi: number;
}

export interface CampaignRow {
  id: string;
  name: string;
  conversion: number; // percent
  revenue: number;
  meetings: number;
  cost: number;
  roi: number; // percent
  top?: boolean;
}

export interface AgentRow {
  id: string;
  name: string;
  calls: number;
  meetings: number;
  conversion: number; // percent
  sentiment: number; // percent
  leadScore: number; // 0-100
  avgDuration: string;
  rank: number;
}

export interface CustomerInsightsData {
  objections: string[];
  questions: string[];
  bestHours: { window: string; note: string };
  topIndustries: string[];
}

export type BusinessMetricIcon = 'forecast' | 'quality' | 'satisfaction' | 'efficiency';

export interface BusinessMetric {
  id: string;
  label: string;
  value: string;
  sublabel?: string; // e.g. "Next 30 Days"
  caption?: string; // e.g. "Estimated"
  change?: string;
  trend?: TrendDir;
  icon: BusinessMetricIcon;
}

export interface CostSlice {
  id: string;
  label: string;
  value: number; // dollars
}

export interface CostBreakdownData {
  slices: CostSlice[];
  total: string; // "$842"
  caption?: string; // "Monthly AI cost"
}

export type RecommendationTone = 'info' | 'positive' | 'warning';

export interface Recommendation {
  id: string;
  text: string;
  tone?: RecommendationTone;
}

export interface ExecutiveReportData {
  title: string;
  body: string;
  footer: string;
}

export interface AnalyticsData {
  kpis: ExecutiveKPI[];
  funnel: FunnelStage[];
  revenueTrend: RevenuePoint[];
  campaigns: CampaignRow[];
  agents: AgentRow[];
  insights: CustomerInsightsData;
  businessMetrics: BusinessMetric[];
  cost: CostBreakdownData;
  recommendations: Recommendation[];
  executiveReport: ExecutiveReportData;
}

export type DateRangeKey = 'today' | '7d' | '30d' | '90d' | 'custom';
