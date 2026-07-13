import React from 'react';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { KnowledgeAnalysisData } from '@/types/call-details';

interface KnowledgeAnalysisProps {
  data: KnowledgeAnalysisData;
  onUpdate?: () => void;
}

export default function KnowledgeAnalysis({ data, onUpdate }: KnowledgeAnalysisProps) {
  const answered = Math.max(0, Math.min(100, data.answeredPercent));

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Knowledge Base Analysis</h3>
          <p className="text-slate-400 text-xs">Coverage of questions raised during the call.</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative w-28 h-28 shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(#6366f1 ${answered * 3.6}deg, #e2e8f0 0deg)`,
            }}
          />
          <div className="absolute inset-[10px] rounded-full bg-white flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800 tracking-tight tabular-nums">{answered}%</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Answered</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Questions answered
            </span>
            <span className="text-sm font-bold text-slate-800 tabular-nums">{data.answeredPercent}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              Not answered
            </span>
            <span className="text-sm font-bold text-slate-500 tabular-nums">{data.unansweredPercent}%</span>
          </div>
        </div>
      </div>

      {/* Missing knowledge */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Missing Knowledge</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.missingTopics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100/70"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onUpdate}
        className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] self-start"
      >
        <RefreshCw className="w-4 h-4" />
        Update Knowledge Base
      </button>
    </div>
  );
}
