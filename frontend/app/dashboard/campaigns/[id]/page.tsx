"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, Layers, Database, EyeOff, Loader2 } from "lucide-react";

import CampaignHeader from "@/components/dashboard/campaign-details/CampaignHeader";
import CampaignKPIs from "@/components/dashboard/campaign-details/CampaignKPIs";
import CampaignProgress from "@/components/dashboard/campaign-details/CampaignProgress";
import PerformanceChart from "@/components/dashboard/campaign-details/PerformanceChart";
import CampaignTimeline from "@/components/dashboard/campaign-details/CampaignTimeline";
import CampaignInsights from "@/components/dashboard/campaign-details/CampaignInsights";
import CampaignFunnel from "@/components/dashboard/campaign-details/CampaignFunnel";
import RecentCallsTable from "@/components/dashboard/campaign-details/RecentCallsTable";
import CampaignSettingsCard from "@/components/dashboard/campaign-details/CampaignSettingsCard";
import CampaignEmptyState from "@/components/dashboard/campaign-details/CampaignEmptyState";
import ExecutiveSummary from "@/components/dashboard/overview/ExecutiveSummary";

import { CampaignDetailData, CampaignRunStatus } from "@/types/campaign-details";
import { mockCampaignDetail, emptyCampaignDetail } from "@/utils/mockCampaignDetail";
import {
  getCampaignAnalytics,
  pauseCampaign,
  startCampaign,
  CampaignAnalyticsResponse,
} from "@/services/campaign-service";

type DataMode = "mock" | "api" | "empty";

// Merge real per-campaign analytics onto the high-fidelity mock. KPIs, funnel,
// progress, recent calls, timeline and settings become real; the performance
// chart, AI insights and executive summary stay from mock until those are
// computed/enriched server-side.
function buildFromAnalytics(a: CampaignAnalyticsResponse): CampaignDetailData {
  const base = mockCampaignDetail;
  return {
    ...base,
    header: {
      name: a.header.name,
      status: (a.header.status as CampaignRunStatus) || "draft",
      createdAt: a.header.createdAt ?? base.header.createdAt,
      updatedAt: a.header.updatedAt ?? base.header.updatedAt,
    },
    kpis: (a.kpis as CampaignDetailData["kpis"]) ?? base.kpis,
    funnel: (a.funnel as CampaignDetailData["funnel"]) ?? base.funnel,
    progress: { ...base.progress, ...a.progress },
    recentCalls: (a.recentCalls as CampaignDetailData["recentCalls"]) ?? base.recentCalls,
    timeline: (a.timeline as CampaignDetailData["timeline"]) ?? base.timeline,
    settings: { ...base.settings, ...(a.settings as Partial<CampaignDetailData["settings"]>) },
  };
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [dataMode, setDataMode] = useState<DataMode>("mock");
  const [apiData, setApiData] = useState<CampaignDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  // Optimistic status after a pause/resume in mock/empty preview modes,
  // where there is no backend record to re-fetch.
  const [statusOverride, setStatusOverride] = useState<CampaignRunStatus | null>(null);

  const refetch = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCampaignAnalytics(campaignId);
      setApiData(buildFromAnalytics(res.data));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to load campaign analytics");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    setStatusOverride(null);
    if (dataMode === "api") refetch();
  }, [dataMode, refetch]);

  const data: CampaignDetailData = useMemo(() => {
    const base =
      dataMode === "empty"
        ? emptyCampaignDetail
        : dataMode === "api" && apiData
        ? apiData
        : mockCampaignDetail;

    if (!statusOverride) return base;
    return {
      ...base,
      header: { ...base.header, status: statusOverride, updatedAt: new Date().toISOString() },
    };
  }, [dataMode, apiData, statusOverride]);

  const hasCalls =
    data.progress.completed > 0 || data.header.status === "running" || data.header.status === "completed";

  // Run a real campaign action; refetch when in Live mode, otherwise
  // reflect the new status optimistically for the design preview.
  const runAction = useCallback(
    async (
      action: () => Promise<unknown>,
      optimistic: CampaignRunStatus,
      successMsg: string,
      failMsg: string
    ) => {
      if (!campaignId) return;
      setActionLoading(true);
      try {
        await action();
        if (dataMode === "api") {
          await refetch();
          setStatusOverride(null);
        } else {
          setStatusOverride(optimistic);
        }
        toast.success(successMsg);
      } catch (err: any) {
        toast.error(err?.response?.data?.detail || failMsg);
      } finally {
        setActionLoading(false);
      }
    },
    [campaignId, dataMode, refetch]
  );

  const handlePause = () =>
    runAction(() => pauseCampaign(campaignId), "paused", "Campaign paused", "Failed to pause campaign");
  const handleResume = () =>
    runAction(() => startCampaign(campaignId), "running", "Campaign resumed", "Failed to resume campaign");
  const handleLaunch = () =>
    runAction(() => startCampaign(campaignId), "running", "Campaign launched", "Failed to launch campaign");
  const handleDuplicate = () => router.push(`/dashboard/campaigns/duplicate/${campaignId}`);
  const handleExport = () => toast.success("Report export started");

  const modes: { key: DataMode; label: string; icon: React.ReactNode; title: string }[] = [
    { key: "mock", label: "Mock", icon: <Layers className="w-3.5 h-3.5" />, title: "High fidelity mock data" },
    { key: "api", label: "Live", icon: <Database className="w-3.5 h-3.5" />, title: "Fetch from backend" },
    { key: "empty", label: "Empty", icon: <EyeOff className="w-3.5 h-3.5" />, title: "Preview empty state" },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-10">
      {/* Breadcrumb + preview toggle */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Campaigns
        </Link>

        <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200/50 shrink-0">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setDataMode(m.key)}
              title={m.title}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                dataMode === m.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <CampaignHeader
        data={data.header}
        busy={actionLoading}
        onPause={handlePause}
        onResume={handleResume}
        onDuplicate={handleDuplicate}
        onExport={handleExport}
      />

      {loading && (
        <div className="w-full flex items-center justify-center py-6 bg-indigo-50/20 border border-indigo-100/50 rounded-2xl">
          <div className="flex items-center gap-2 text-indigo-500 text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching campaign analytics...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-medium">
          {error}. Showing high-fidelity mock data instead.
        </div>
      )}

      {!hasCalls ? (
        <CampaignEmptyState onLaunch={handleLaunch} />
      ) : (
        <>
          {/* Top KPI row */}
          <CampaignKPIs cards={data.kpis} />

          {/* Section 2 — Progress + Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CampaignProgress data={data.progress} />
            </div>
            <div className="lg:col-span-2">
              <PerformanceChart data={data.chart} />
            </div>
          </div>

          {/* Section 3 — Activity + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CampaignTimeline items={data.timeline} />
            <CampaignInsights insights={data.insights} />
          </div>

          {/* Section 4 — Funnel */}
          <CampaignFunnel stages={data.funnel} />

          {/* Section 5 — Recent Calls */}
          <RecentCallsTable calls={data.recentCalls} onViewDetails={() => toast("Opening call details…")} />

          {/* Section 6 — Settings */}
          <CampaignSettingsCard settings={data.settings} />

          {/* Bottom — Executive AI Summary */}
          <ExecutiveSummary summary={data.summary} />
        </>
      )}
    </div>
  );
}
