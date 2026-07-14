"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";

import AnalyticsHeader from "@/components/dashboard/analytics/AnalyticsHeader";
import ExecutiveKPIs from "@/components/dashboard/analytics/ExecutiveKPIs";
import ExecutiveFunnel from "@/components/dashboard/analytics/ExecutiveFunnel";
import RevenueChart from "@/components/dashboard/analytics/RevenueChart";
import CampaignRanking from "@/components/dashboard/analytics/CampaignRanking";
import AILeaderboard from "@/components/dashboard/analytics/AILeaderboard";
import CustomerInsights from "@/components/dashboard/analytics/CustomerInsights";
import BusinessMetrics from "@/components/dashboard/analytics/BusinessMetrics";
import CostBreakdown from "@/components/dashboard/analytics/CostBreakdown";
import StrategicRecommendations from "@/components/dashboard/analytics/StrategicRecommendations";
import QuickActions, { QuickActionKey } from "@/components/dashboard/analytics/QuickActions";
import ExecutiveSummary from "@/components/dashboard/overview/ExecutiveSummary";

import { DateRangeKey } from "@/types/analytics";
import { mockAnalyticsData } from "@/utils/mockAnalytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const data = mockAnalyticsData;
  const [range, setRange] = useState<DateRangeKey>("30d");

  const hasData = data.kpis.length > 0 && data.funnel.length > 0;

  const handleQuickAction = (key: QuickActionKey) => {
    switch (key) {
      case "create-campaign":
        router.push("/dashboard/campaigns/create");
        break;
      case "view-conversations":
        router.push("/dashboard/call-logs");
        break;
      case "optimize-agent":
        router.push("/dashboard/agents");
        break;
      case "export":
        toast.success("Exporting analytics…");
        break;
      case "pdf":
        toast.success("Generating executive PDF…");
        break;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-12">
      <AnalyticsHeader
        range={range}
        onRangeChange={setRange}
        onExport={() => toast.success("Exporting report…")}
        onSchedule={() => toast("Schedule a recurring report")}
      />

      {!hasData ? (
        <EmptyState onCreate={() => router.push("/dashboard/campaigns/create")} />
      ) : (
        <>
          {/* Executive KPIs */}
          <ExecutiveKPIs cards={data.kpis} />

          {/* Funnel */}
          <ExecutiveFunnel stages={data.funnel} />

          {/* Revenue trend + campaign ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <RevenueChart data={data.revenueTrend} />
            </div>
            <div className="lg:col-span-2">
              <CampaignRanking campaigns={data.campaigns} />
            </div>
          </div>

          {/* AI workforce leaderboard */}
          <AILeaderboard agents={data.agents} />

          {/* Customer insights */}
          <CustomerInsights data={data.insights} />

          {/* Business intelligence */}
          <BusinessMetrics metrics={data.businessMetrics} />

          {/* Cost breakdown + strategic recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <CostBreakdown data={data.cost} />
            </div>
            <div className="lg:col-span-3">
              <StrategicRecommendations recommendations={data.recommendations} />
            </div>
          </div>

          {/* Executive report */}
          <ExecutiveSummary summary={data.executiveReport} />

          {/* Quick actions */}
          <QuickActions onAction={handleQuickAction} />
        </>
      )}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="w-full bg-white rounded-2xl p-10 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col items-center justify-center text-center min-h-[440px]">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-6">
        <BarChart3 className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 font-sans tracking-tight mb-2">Not enough data yet</h3>
      <p className="text-slate-400 text-sm font-medium max-w-md mb-8 leading-relaxed">
        Launch campaigns to begin generating business intelligence.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
      >
        Create Campaign
      </button>
    </div>
  );
}
