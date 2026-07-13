"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronLeft, LayoutGrid, Sparkles } from "lucide-react";

import CallHeader from "@/components/dashboard/call-details/CallHeader";
import CallKPIs from "@/components/dashboard/call-details/CallKPIs";
import AudioPlayer, { AudioPlayerHandle } from "@/components/dashboard/call-details/AudioPlayer";
import AISummary from "@/components/dashboard/call-details/AISummary";
import ConversationInsights from "@/components/dashboard/call-details/ConversationInsights";
import TranscriptViewer from "@/components/dashboard/call-details/TranscriptViewer";
import BusinessAnalysis from "@/components/dashboard/call-details/BusinessAnalysis";
import ExtractedInformation from "@/components/dashboard/call-details/ExtractedInformation";
import NextActions from "@/components/dashboard/call-details/NextActions";
import FollowUpGenerator from "@/components/dashboard/call-details/FollowUpGenerator";
import ConversationCoaching from "@/components/dashboard/call-details/ConversationCoaching";
import KnowledgeAnalysis from "@/components/dashboard/call-details/KnowledgeAnalysis";
import ExecutiveReport from "@/components/dashboard/call-details/ExecutiveReport";
import AIImprovementTab from "@/components/dashboard/call-details/ai-improvement/AIImprovementTab";

import { CallDetailData } from "@/types/call-details";
import { mockCallDetail } from "@/utils/mockCallDetail";

type CallTab = "overview" | "improvement";

export default function CallDetailsPage() {
  // Prop-driven: swap `data` for a fetched record when the backend is ready.
  const [data] = useState<CallDetailData>(mockCallDetail);
  const [tab, setTab] = useState<CallTab>("overview");

  const playerRef = useRef<AudioPlayerHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const goToImprovement = () => {
    setTab("improvement");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeek = (seconds: number) => playerRef.current?.seek(seconds);

  const fmtTs = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Build a formatted transcript file from the call data (no backend needed).
  const handleDownloadTranscript = () => {
    const { header, transcript, summary } = data;
    const lines: string[] = [
      `Call Transcript — ${header.customerName} (${header.company})`,
      `Campaign: ${header.campaign}`,
      `Phone: ${header.phone}`,
      `Date: ${new Date(header.date).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}  ·  Duration: ${header.durationLabel}  ·  Status: ${header.status}`,
      "",
      "──────────────────────────────",
      "TRANSCRIPT",
      "──────────────────────────────",
    ];

    if (transcript && transcript.length > 0) {
      transcript.forEach((seg) => {
        const who = seg.speaker === "ai" ? "AI Agent" : "Customer";
        lines.push(`[${fmtTs(seg.timestamp)}] ${who}: ${seg.text}`);
      });
    } else {
      lines.push("Transcript processing…");
    }

    if (summary && summary.length > 0) {
      lines.push("", "──────────────────────────────", "AI SUMMARY", "──────────────────────────────");
      summary.forEach((point) => lines.push(`• ${point}`));
    }

    lines.push("", "Generated automatically by V3 AI");

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${header.customerName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded");
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `Call with ${data.header.customerName} — ${data.header.company}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch {
      /* share cancelled or clipboard unavailable */
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/call-logs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Call History
      </Link>

      {/* Header */}
      <CallHeader
        data={data.header}
        onReplay={() => playerRef.current?.play()}
        onDownload={handleDownloadTranscript}
        onShare={handleShare}
      />

      {/* Tabs — Overview | AI Improvement */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50 w-full sm:w-auto sm:inline-flex">
        <button
          onClick={() => setTab("overview")}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            tab === "overview" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setTab("improvement")}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            tab === "improvement" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Improvement
        </button>
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          {/* Top KPI row */}
          <CallKPIs cards={data.kpis} />

          {/* Section 2 — Player + Summary (60) / Intelligence (40) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <AudioPlayer ref={playerRef} recording={data.recording} onTimeUpdate={setCurrentTime} />
              <AISummary points={data.summary} />
            </div>
            <div className="lg:col-span-2">
              <ConversationInsights metrics={data.intelligence} />
            </div>
          </div>

          {/* Section 3 — Transcript */}
          <TranscriptViewer segments={data.transcript} currentTime={currentTime} onSeek={handleSeek} />

          {/* Section 4 — Business Analysis */}
          <BusinessAnalysis items={data.businessAnalysis} />

          {/* Section 5 — Extracted Information */}
          <ExtractedInformation fields={data.extracted} />

          {/* Section 6 + 7 — Next Actions / Follow-up Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NextActions
              actions={data.nextActions}
              onAssign={() => toast("Assign to teammate…")}
              onSchedule={() => toast("Schedule action…")}
            />
            <FollowUpGenerator
              data={data.followUp}
              onRegenerate={() => toast("Regenerating message…")}
              onSendLater={() => toast.success("Scheduled to send later")}
            />
          </div>

          {/* Section 8 + 9 — Coaching / Knowledge Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConversationCoaching data={data.coaching} onCreateImprovedPrompt={goToImprovement} />
            <KnowledgeAnalysis data={data.knowledge} onUpdate={() => toast.success("Knowledge base updated")} />
          </div>

          {/* Bottom — Executive Conversation Report */}
          <ExecutiveReport report={data.executiveReport} />
        </div>
      ) : (
        <AIImprovementTab
          improvement={data.improvement}
          knowledge={data.knowledge}
          target={data.header.campaign}
          onDeploy={() => toast.success("Prompt v2 deployed to future calls")}
          onUpdateKnowledge={() => toast.success("Knowledge base updated")}
          onCopySuggested={() => toast.success("Suggested prompt copied")}
        />
      )}
    </div>
  );
}
