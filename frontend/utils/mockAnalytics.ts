import { AnalyticsData, RevenuePoint } from '@/types/analytics';

const generateRevenueTrend = (): RevenuePoint[] => {
  const data: RevenuePoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400 * 1000);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const base = Math.sin(i / 5) * 12 + Math.cos(i / 9) * 8 + 40;
    const meetings = Math.round(base * 0.28 + 4);
    const conversions = Math.round(meetings * 0.42);
    const revenue = Math.round(base * 900 + 6000);
    const pipeline = Math.round(revenue * 3.2);
    const cost = Math.round(base * 0.9 + 12);
    const roi = Math.round((revenue / Math.max(cost, 1)) * 12);
    data.push({ date, revenue, pipeline, meetings, conversions, cost, roi });
  }
  return data;
};

export const mockAnalyticsData: AnalyticsData = {
  kpis: [
    { id: 'pipeline', label: 'Revenue Pipeline', value: '$1.24M', change: '12%', trend: 'up', positiveWhenUp: true, icon: 'pipeline' },
    { id: 'meetings', label: 'Meetings Booked', value: '342', change: '18%', trend: 'up', positiveWhenUp: true, icon: 'meetings' },
    { id: 'leads', label: 'Qualified Leads', value: '948', change: '9%', trend: 'up', positiveWhenUp: true, icon: 'leads' },
    { id: 'conversion', label: 'Conversion Rate', value: '28.4%', change: '4%', trend: 'up', positiveWhenUp: true, icon: 'conversion' },
    { id: 'cost', label: 'AI Operating Cost', value: '$842', change: '6%', trend: 'down', positiveWhenUp: false, icon: 'cost' },
    {
      id: 'roi',
      label: 'ROI',
      value: '486%',
      change: '14%',
      trend: 'up',
      positiveWhenUp: true,
      icon: 'roi',
      isHero: true,
      heroSubtitle: 'Revenue Generated / AI Cost',
    },
  ],

  funnel: [
    { id: 'imported', label: 'Leads Imported', value: 12480 },
    { id: 'completed', label: 'Calls Completed', value: 9240 },
    { id: 'answered', label: 'Answered', value: 6180 },
    { id: 'interested', label: 'Interested', value: 2940 },
    { id: 'qualified', label: 'Qualified', value: 948 },
    { id: 'appointments', label: 'Appointments', value: 342 },
    { id: 'customers', label: 'Customers', value: 143 },
  ],

  revenueTrend: generateRevenueTrend(),

  campaigns: [
    { id: 'c1', name: 'Hospital Appointment Reminder', conversion: 31.2, revenue: 486000, meetings: 124, cost: 268, roi: 612, top: true },
    { id: 'c2', name: 'Real Estate Seller Outreach', conversion: 24.8, revenue: 342000, meetings: 86, cost: 214, roi: 498 },
    { id: 'c3', name: 'Fall Enrollment Drive', conversion: 22.1, revenue: 214000, meetings: 62, cost: 152, roi: 421 },
    { id: 'c4', name: 'Retail Loyalty Win-back', conversion: 18.4, revenue: 128000, meetings: 41, cost: 118, roi: 287 },
    { id: 'c5', name: 'Manufacturing Supplier Check-in', conversion: 12.6, revenue: 64000, meetings: 22, cost: 90, roi: 184 },
  ],

  agents: [
    { id: 'a1', name: 'Hospital AI Agent', calls: 3482, meetings: 124, conversion: 31.2, sentiment: 94, leadScore: 88, avgDuration: '2m 11s', rank: 1 },
    { id: 'a2', name: 'Real Estate AI Agent', calls: 2940, meetings: 86, conversion: 24.8, sentiment: 90, leadScore: 82, avgDuration: '2m 34s', rank: 2 },
    { id: 'a3', name: 'Enrollment AI Agent', calls: 2110, meetings: 62, conversion: 22.1, sentiment: 88, leadScore: 79, avgDuration: '2m 02s', rank: 3 },
    { id: 'a4', name: 'Retail AI Agent', calls: 1780, meetings: 41, conversion: 18.4, sentiment: 84, leadScore: 71, avgDuration: '1m 48s', rank: 4 },
    { id: 'a5', name: 'Manufacturing AI Agent', calls: 1240, meetings: 22, conversion: 12.6, sentiment: 80, leadScore: 64, avgDuration: '2m 20s', rank: 5 },
  ],

  insights: {
    objections: ['Pricing', 'Integration', 'Timing', 'Budget'],
    questions: ['Implementation', 'Pricing', 'Support', 'Timeline'],
    bestHours: { window: '4 PM – 6 PM', note: 'Highest conversion' },
    topIndustries: ['Healthcare', 'Real Estate', 'Education', 'Retail'],
  },

  businessMetrics: [
    { id: 'forecast', label: 'Revenue Forecast', value: '$2.1M', caption: 'Estimated', sublabel: 'Next 30 Days', trend: 'up', change: '15%', icon: 'forecast' },
    { id: 'quality', label: 'Lead Quality', value: 'Improved', caption: 'Score trend', sublabel: '+11% this month', trend: 'up', change: '11%', icon: 'quality' },
    { id: 'satisfaction', label: 'Customer Satisfaction', value: '91%', caption: 'CSAT', sublabel: 'Across conversations', trend: 'up', change: '3%', icon: 'satisfaction' },
    { id: 'efficiency', label: 'AI Efficiency', value: '8 FTEs', caption: 'Equivalent to', sublabel: 'Full-time employees', icon: 'efficiency' },
  ],

  cost: {
    slices: [
      { id: 'twilio', label: 'Twilio', value: 312 },
      { id: 'llm', label: 'LLM', value: 268 },
      { id: 'stt', label: 'Speech-to-Text', value: 126 },
      { id: 'tts', label: 'Text-to-Speech', value: 92 },
      { id: 'storage', label: 'Storage', value: 44 },
    ],
    total: '$842',
    caption: 'Monthly AI cost',
  },

  recommendations: [
    { id: 'r1', text: 'Hospital campaigns outperform Real Estate by 23% — shift budget toward healthcare.', tone: 'positive' },
    { id: 'r2', text: 'Calling after 4 PM increases appointments by 29%. Weight scheduling toward late afternoon.', tone: 'info' },
    { id: 'r3', text: 'Shortening the opening script by ~10s improves engagement and answer rates.', tone: 'info' },
    { id: 'r4', text: 'Increase retry attempts from 2 to 3 for healthcare campaigns to recover more conversations.', tone: 'info' },
    { id: 'r5', text: 'Pause “Manufacturing Supplier Check-in” — ROI (184%) has fallen below the 200% target.', tone: 'warning' },
  ],

  executiveReport: {
    title: 'Executive Report',
    body: 'During the selected period, V3 generated an estimated $1.24M sales pipeline while maintaining an AI operating cost of only $842. Campaign efficiency improved by 18% compared to the previous month. Healthcare remains the strongest-performing industry, while pricing continues to be the primary customer objection. The AI workforce completed work equivalent to approximately eight full-time employees.',
    footer: 'Generated automatically by V3 AI',
  },
};

export const emptyAnalyticsData: AnalyticsData = {
  ...mockAnalyticsData,
  kpis: [],
  funnel: [],
  revenueTrend: [],
  campaigns: [],
  agents: [],
};
