"use client";

import { useEffect, useState } from "react";
import { Loader2, Database, Layers, EyeOff } from "lucide-react";
import { api } from "@/services/api";

import KPICards from "@/components/dashboard/overview/KPICards";
import PerformanceChart from "@/components/dashboard/overview/PerformanceChart";
import AIActivityCard from "@/components/dashboard/overview/AIActivityCard";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";
import AIInsights from "@/components/dashboard/overview/AIInsights";
import ExecutiveSummary from "@/components/dashboard/overview/ExecutiveSummary";
import EmptyState from "@/components/dashboard/overview/EmptyState";

import { DashboardData } from "@/types/overview";
import { 
  mockDashboardData, 
  emptyDashboardData, 
  generateChartData 
} from "@/utils/mockOverviewData";

interface AnalyticsData {
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  average_duration_seconds: number;
  active_campaigns: number;
  total_contacts: number;
  call_trends: { date: string; calls: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>(mockDashboardData);
  const [realApiData, setRealApiData] = useState<AnalyticsData | null>(null);
  
  // Data Modes: 
  // - 'mock': high fidelity mock data
  // - 'api': actual data from the database mapped to the new layout
  // - 'empty': empty state (active_campaigns = 0)
  const [dataMode, setDataMode] = useState<'mock' | 'api' | 'empty'>('mock');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate 90 days chart data once
  const [chartData] = useState(generateChartData());

  useEffect(() => {
    if (dataMode !== 'api') {
      setError(null);
      if (dataMode === 'mock') {
        setData(mockDashboardData);
      } else {
        setData(emptyDashboardData);
      }
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/call/analytics");
        const apiData: AnalyticsData = res.data;
        setRealApiData(apiData);

        // Map the backend data onto our DashboardData structure
        const avgDuration = Math.round(apiData.average_duration_seconds || 0);
        const avgMin = Math.floor(avgDuration / 60);
        const avgSec = avgDuration % 60;
        const durationStr = avgMin > 0 ? `${avgMin}m ${avgSec}s` : `${avgSec}s`;

        const mappedData: DashboardData = {
          kpiCards: [
            {
              id: 'ai-calls-today',
              title: 'AI Calls Today',
              value: apiData.total_calls || 0,
              change: '+18% vs yesterday',
              changeType: 'positive',
              iconName: 'phone'
            },
            {
              id: 'meetings-booked',
              title: 'Meetings Booked',
              value: Math.round((apiData.total_calls || 0) * 0.08), // mock derived meetings
              change: 'Today\'s confirmed meetings',
              changeType: 'neutral',
              iconName: 'calendar-check'
            },
            {
              id: 'qualified-leads',
              title: 'Qualified Leads',
              value: apiData.total_contacts || 0,
              infoText: 'Lead score > 75',
              iconName: 'users'
            },
            {
              id: 'conversion-rate',
              title: 'Conversion Rate',
              value: apiData.total_calls > 0 
                ? `${((apiData.completed_calls / apiData.total_calls) * 100).toFixed(1)}%` 
                : '0.0%',
              change: 'Answered → Qualified',
              changeType: 'neutral',
              iconName: 'trending-up'
            },
            {
              id: 'ai-cost-today',
              title: 'AI Cost Today',
              value: `$${((apiData.total_calls || 0) * 0.08).toFixed(2)}`,
              change: 'Twilio + LLM + Voice',
              changeType: 'neutral',
              iconName: 'wallet'
            },
            {
              id: 'estimated-pipeline',
              title: 'Estimated Pipeline',
              value: `$${((apiData.total_calls || 0) * 250).toLocaleString()}`,
              change: '↑ 14% this week',
              changeType: 'positive',
              infoText: 'Potential business generated',
              iconName: 'trending-up',
              isHero: true
            }
          ],
          activity: {
            completed: apiData.completed_calls || 0,
            inProgress: apiData.total_calls - apiData.completed_calls - apiData.failed_calls > 0 
              ? apiData.total_calls - apiData.completed_calls - apiData.failed_calls 
              : 0,
            waiting: 0,
            failed: apiData.failed_calls || 0,
            averageDuration: durationStr
          },
          // Fallback to high fidelity activity list and insights from mock structure
          recentActivity: mockDashboardData.recentActivity,
          insights: mockDashboardData.insights,
          executiveSummary: {
            title: "Today's Executive Summary",
            body: `Today your AI workforce completed ${apiData.total_calls || 0} outbound conversations. ${apiData.completed_calls || 0} calls completed successfully with an average duration of ${durationStr}. Success rate of completed conversations is ${apiData.total_calls > 0 ? ((apiData.completed_calls / apiData.total_calls) * 100).toFixed(1) : 0}%.`,
            footer: 'Generated automatically by V3 AI'
          }
        };

        setData(mappedData);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message);
        // Fallback to mock on API error
        setData(mockDashboardData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dataMode]);

  const activeCampaignsCount = dataMode === 'empty' 
    ? 0 
    : (dataMode === 'api' && realApiData ? realApiData.active_campaigns : 3);

  return (
    <div className="w-full space-y-8 pb-10">
      
      {/* Header controls & toggles */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-4xl font-semibold text-slate-800 tracking-tight font-sans">
            Overview
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base font-medium max-w-2xl">
            Monitor your AI workforce, campaign performance, business outcomes and revenue generation in real time.
          </p>
        </div>

        {/* Developer state controls */}
        <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200/50 shrink-0 self-start md:self-center">
          <button
            onClick={() => setDataMode('mock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
              dataMode === 'mock'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="High Fidelity Mock Data"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mock State</span>
          </button>
          <button
            onClick={() => setDataMode('api')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
              dataMode === 'api'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Fetch from backend API"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Live API</span>
          </button>
          <button
            onClick={() => setDataMode('empty')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
              dataMode === 'empty'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Review campaign empty state"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Empty State</span>
          </button>
        </div>
      </header>

      {/* API Loader / Error alerts */}
      {loading && (
        <div className="w-full flex items-center justify-center py-6 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-500 text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching backend analytics...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-medium">
          Failed to fetch real-time backend statistics: {error}. Falling back to default dashboard mock.
        </div>
      )}

      {/* Main Dashboard Layout */}
      {activeCampaignsCount === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Top KPI statistics cards grid */}
          <KPICards cards={data.kpiCards} />

          {/* Second section: Activity list + line chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AIActivityCard activity={data.activity} />
            </div>
            <div className="lg:col-span-2">
              <PerformanceChart data={chartData} />
            </div>
          </div>

          {/* Third section: Timeline events + AI insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity activities={data.recentActivity} />
            <AIInsights insights={data.insights} />
          </div>

          {/* Bottom section: Automated brief summaries */}
          <ExecutiveSummary summary={data.executiveSummary} />
        </div>
      )}
    </div>
  );
}