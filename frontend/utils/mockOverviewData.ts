import { DashboardData, ChartDataPoint } from '../types/overview';

export const mockDashboardData: DashboardData = {
  kpiCards: [
    {
      id: 'ai-calls-today',
      title: 'AI Calls Today',
      value: 486,
      change: '+18% vs yesterday',
      changeType: 'positive',
      iconName: 'phone'
    },
    {
      id: 'meetings-booked',
      title: 'Meetings Booked',
      value: 31,
      change: 'Today\'s confirmed meetings',
      changeType: 'neutral',
      iconName: 'calendar-check'
    },
    {
      id: 'qualified-leads',
      title: 'Qualified Leads',
      value: 84,
      infoText: 'Lead score > 75',
      iconName: 'users'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '27.4%',
      change: 'Answered → Qualified',
      changeType: 'neutral',
      iconName: 'trending-up'
    },
    {
      id: 'ai-cost-today',
      title: 'AI Cost Today',
      value: '$38.42',
      change: 'Twilio + LLM + Voice',
      changeType: 'neutral',
      iconName: 'wallet'
    },
    {
      id: 'estimated-pipeline',
      title: 'Estimated Pipeline',
      value: '$124,000',
      change: '↑ 14% this week',
      changeType: 'positive',
      infoText: 'Potential business generated',
      iconName: 'trending-up',
      isHero: true
    }
  ],
  activity: {
    completed: 412,
    inProgress: 18,
    waiting: 42,
    failed: 14,
    averageDuration: '2m 11s'
  },
  recentActivity: [
    {
      id: 'act-1',
      type: 'success',
      title: 'Appointment booked',
      campaign: 'Hospital Campaign',
      time: '2 min ago'
    },
    {
      id: 'act-2',
      type: 'success',
      title: 'Follow-up scheduled',
      campaign: 'Real Estate Campaign',
      time: '12 min ago'
    },
    {
      id: 'act-3',
      type: 'warning',
      title: 'Customer requested callback',
      campaign: 'Real Estate Campaign',
      time: '26 min ago'
    },
    {
      id: 'act-4',
      type: 'success',
      title: 'New qualified lead',
      campaign: 'Hospital Campaign',
      time: '42 min ago'
    }
  ],
  insights: [
    {
      id: 'ins-1',
      text: 'Your hospital campaign performs 31% better after 4 PM.'
    },
    {
      id: 'ins-2',
      text: 'Customers ask about pricing in 62% of successful calls.'
    },
    {
      id: 'ins-3',
      text: 'Retrying unanswered numbers tomorrow could recover approximately 17 additional conversations.'
    },
    {
      id: 'ins-4',
      text: 'Lead quality increased 11% this week.'
    }
  ],
  executiveSummary: {
    title: "Today's Executive Summary",
    body: "Today your AI workforce completed 486 outbound conversations across three active campaigns. 31 meetings were booked and 84 qualified opportunities were identified. Estimated sales pipeline generated today is approximately $124,000. Average customer sentiment remains positive with a 91% satisfaction score. Compared to yesterday, meeting conversion improved by 14%.",
    footer: 'Generated automatically by V3 AI'
  }
};

export const emptyDashboardData: DashboardData = {
  kpiCards: [
    {
      id: 'ai-calls-today',
      title: 'AI Calls Today',
      value: 0,
      change: '0% vs yesterday',
      changeType: 'neutral',
      iconName: 'phone'
    },
    {
      id: 'meetings-booked',
      title: 'Meetings Booked',
      value: 0,
      change: 'Today\'s confirmed meetings',
      changeType: 'neutral',
      iconName: 'calendar-check'
    },
    {
      id: 'qualified-leads',
      title: 'Qualified Leads',
      value: 0,
      infoText: 'Lead score > 75',
      iconName: 'users'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '0.0%',
      change: 'Answered → Qualified',
      changeType: 'neutral',
      iconName: 'trending-up'
    },
    {
      id: 'ai-cost-today',
      title: 'AI Cost Today',
      value: '$0.00',
      change: 'Twilio + LLM + Voice',
      changeType: 'neutral',
      iconName: 'wallet'
    },
    {
      id: 'estimated-pipeline',
      title: 'Estimated Pipeline',
      value: '$0',
      change: '0% this week',
      changeType: 'neutral',
      infoText: 'Potential business generated',
      iconName: 'trending-up',
      isHero: true
    }
  ],
  activity: {
    completed: 0,
    inProgress: 0,
    waiting: 0,
    failed: 0,
    averageDuration: '0s'
  },
  recentActivity: [],
  insights: [],
  executiveSummary: {
    title: "Today's Executive Summary",
    body: "No active campaigns are currently running. Create your first campaign to start making AI calls and gather insights.",
    footer: 'Generated automatically by V3 AI'
  }
};

// Generate 90 days of call performance data for testing charts
export const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Add some random-ish but structured values that look real
    // Base curves to make them look nice
    const factor = Math.sin(i / 5) * 15 + Math.cos(i / 10) * 10 + 50;
    
    data.push({
      date: dateStr,
      calls: Math.round(factor * 4 + 100),
      meetings: Math.round(factor * 0.3 + 10),
      conversions: Math.round((factor * 0.3 + 10) * (0.6 + Math.sin(i) * 0.1)),
      revenue: Math.round((factor * 0.3 + 10) * 4000 + Math.random() * 2000)
    });
  }
  
  return data;
};
