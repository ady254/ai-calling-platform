import {
  CampaignChartPoint,
  CampaignDetailData,
} from '@/types/campaign-details';

// Deterministic 90-day performance series so charts look real without
// re-randomising on every render. Mirrors the shape used across V3.
export const generateCampaignChartData = (): CampaignChartPoint[] => {
  const data: CampaignChartPoint[] = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    // Smooth structured curve — reads like a healthy ramping campaign.
    const factor = Math.sin(i / 6) * 12 + Math.cos(i / 11) * 8 + 42;
    const calls = Math.round(factor * 1.6 + 26);
    const conversions = Math.round(calls * 0.19);
    const appointments = Math.round(calls * 0.065 + 1);
    const revenue = Math.round(conversions * 4000 + factor * 40);

    data.push({ date: dateStr, calls, conversions, appointments, revenue });
  }

  return data;
};

const chart = generateCampaignChartData();

// ── Fully populated ("running" campaign) ───────────────────────────────
export const mockCampaignDetail: CampaignDetailData = {
  header: {
    name: 'Hospital Appointment Reminder',
    status: 'running',
    createdAt: '2026-07-13T09:12:00Z',
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  kpis: [
    {
      id: 'calls-completed',
      title: 'Calls Completed',
      value: 486,
      subLabel: '+12 today',
      changeType: 'positive',
      icon: 'calls-completed',
    },
    {
      id: 'calls-in-progress',
      title: 'Calls In Progress',
      value: 8,
      subLabel: 'Currently active',
      changeType: 'neutral',
      icon: 'in-progress',
    },
    {
      id: 'qualified-leads',
      title: 'Qualified Leads',
      value: 84,
      subLabel: 'Lead Score >75',
      changeType: 'neutral',
      icon: 'qualified',
    },
    {
      id: 'appointments-booked',
      title: 'Appointments Booked',
      value: 31,
      subLabel: "Today's bookings",
      changeType: 'neutral',
      icon: 'appointments',
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '27.4%',
      subLabel: 'Answered → Qualified',
      changeType: 'neutral',
      icon: 'conversion',
    },
    {
      id: 'estimated-pipeline',
      title: 'Estimated Pipeline',
      value: '$124,000',
      subLabel: 'Generated opportunities',
      changeType: 'positive',
      icon: 'pipeline',
      isHero: true,
    },
  ],
  progress: {
    completed: 486,
    total: 700,
    etaLabel: '2h 14m remaining',
    retryQueue: 24,
    failedCalls: 12,
    successRate: 81,
  },
  chart,
  timeline: [
    { id: 't1', type: 'success', title: 'Appointment booked', time: '2 min ago' },
    { id: 't2', type: 'success', title: 'Call completed', time: '5 min ago' },
    { id: 't3', type: 'warning', title: 'Customer requested callback', time: '9 min ago' },
    { id: 't4', type: 'info', title: 'Knowledge Base updated', time: '1 hour ago' },
  ],
  insights: [
    { id: 'i1', text: 'Hospital campaign performs 28% better after 4 PM.' },
    { id: 'i2', text: 'Pricing objections appear in 41% of failed calls.' },
    { id: 'i3', text: 'Retrying tomorrow morning could recover 16 conversations.' },
    { id: 'i4', text: 'Conversation quality improved 12% since yesterday.' },
  ],
  funnel: [
    { id: 'f1', label: 'Uploaded', value: 700 },
    { id: 'f2', label: 'Answered', value: 486 },
    { id: 'f3', label: 'Interested', value: 214 },
    { id: 'f4', label: 'Qualified', value: 84 },
    { id: 'f5', label: 'Appointments', value: 31 },
    { id: 'f6', label: 'Converted', value: 9 },
  ],
  recentCalls: [
    {
      id: 'c1',
      customer: 'John Smith',
      duration: '2m 18s',
      outcome: 'Qualified',
      leadScore: 92,
      sentiment: 'Positive',
      nextAction: 'Schedule Follow-up',
    },
    {
      id: 'c2',
      customer: 'Maria Gonzalez',
      duration: '3m 04s',
      outcome: 'Appointment',
      leadScore: 88,
      sentiment: 'Positive',
      nextAction: 'Send Confirmation',
    },
    {
      id: 'c3',
      customer: 'David Chen',
      duration: '1m 47s',
      outcome: 'Callback',
      leadScore: 64,
      sentiment: 'Neutral',
      nextAction: 'Retry Tomorrow 10 AM',
    },
    {
      id: 'c4',
      customer: 'Aisha Patel',
      duration: '2m 52s',
      outcome: 'Qualified',
      leadScore: 79,
      sentiment: 'Positive',
      nextAction: 'Schedule Follow-up',
    },
    {
      id: 'c5',
      customer: 'Robert Johnson',
      duration: '0m 41s',
      outcome: 'Not Interested',
      leadScore: 22,
      sentiment: 'Negative',
      nextAction: 'Remove from List',
    },
    {
      id: 'c6',
      customer: 'Emily Turner',
      duration: '0m 12s',
      outcome: 'Voicemail',
      leadScore: 40,
      sentiment: 'Neutral',
      nextAction: 'Retry Later',
    },
  ],
  settings: {
    voice: 'Sophia — Warm Female',
    language: 'English (US)',
    retries: '2 attempts · 4h apart',
    knowledgeBase: 'Hospital FAQ v4',
    promptVersion: 'v3.2',
    launchSchedule: 'Weekdays · 9 AM – 6 PM',
    timezone: 'America/New_York (EST)',
  },
  summary: {
    title: 'Executive AI Summary',
    body: 'This campaign has completed 486 conversations and generated 31 appointments with an estimated sales pipeline of $124,000. Customers respond best between 4 PM and 6 PM. Pricing remains the most common objection. AI recommends shortening the opening introduction by approximately 10 seconds to improve engagement.',
    footer: 'Generated automatically by V3 AI',
  },
};

// ── Empty ("ready to launch") variant ──────────────────────────────────
export const emptyCampaignDetail: CampaignDetailData = {
  ...mockCampaignDetail,
  header: {
    ...mockCampaignDetail.header,
    status: 'draft',
    updatedAt: mockCampaignDetail.header.createdAt,
  },
  progress: {
    completed: 0,
    total: 700,
    etaLabel: 'Not started',
    retryQueue: 0,
    failedCalls: 0,
    successRate: 0,
  },
};
