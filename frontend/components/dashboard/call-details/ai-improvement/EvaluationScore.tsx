import React from 'react';
import { Gauge } from 'lucide-react';
import { EvaluationData } from '@/types/call-details';

interface EvaluationScoreProps {
  data: EvaluationData;
}

function barColor(score: number) {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-rose-500';
}

function scoreText(score: number) {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

export default function EvaluationScore({ data }: EvaluationScoreProps) {
  const overall = Math.max(0, Math.min(100, data.overall));

  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <Gauge className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Conversation Evaluation</h3>
          <p className="text-slate-400 text-xs">AI-scored performance across five dimensions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center">
        {/* Overall score ring */}
        <div className="lg:col-span-2 flex items-center gap-5">
          <div className="relative w-32 h-32 shrink-0">
            <div
              className="w-full h-full rounded-full"
              style={{ background: `conic-gradient(#6366f1 ${overall * 3.6}deg, #e2e8f0 0deg)` }}
            />
            <div className="absolute inset-[11px] rounded-full bg-white flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800 tracking-tight tabular-nums leading-none">
                {overall}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">out of 100</span>
            </div>
          </div>
          <div>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/70">
              {data.grade}
            </span>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mt-3 max-w-xs">{data.summary}</p>
          </div>
        </div>

        {/* Dimension breakdown */}
        <div className="lg:col-span-3 space-y-3.5">
          {data.dimensions.map((dim) => (
            <div key={dim.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-600 font-medium">{dim.label}</span>
                <span className={`text-sm font-bold tabular-nums ${scoreText(dim.score)}`}>{dim.score}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${barColor(dim.score)}`} style={{ width: `${dim.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
