export interface KPICardData {
  id: string;
  title: string;
  value: string | number;
  change?: string; // e.g. "+18% vs yesterday" or "↑ 14% this week"
  changeType?: 'positive' | 'negative' | 'neutral';
  infoText?: string; // e.g. "Lead score > 75"
  iconName: 'phone' | 'calendar-check' | 'users' | 'trending-up' | 'wallet';
  isHero?: boolean;
}

export interface AIActivityData {
  completed: number;
  inProgress: number;
  waiting: number;
  failed: number;
  averageDuration: string; // e.g. "2m 11s"
}

export interface RecentActivityData {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  campaign: string;
  time: string;
}

export interface AIInsightData {
  id: string;
  text: string;
}

export interface ChartDataPoint {
  date: string;
  calls: number;
  meetings: number;
  conversions: number;
  revenue: number;
}

export interface DashboardData {
  kpiCards: KPICardData[];
  activity: AIActivityData;
  recentActivity: RecentActivityData[];
  insights: AIInsightData[];
  executiveSummary: {
    title: string;
    body: string;
    footer: string;
  };
}
