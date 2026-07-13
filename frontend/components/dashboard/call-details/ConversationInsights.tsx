import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { IntelligenceMetric, Tone } from '@/types/call-details';

interface ConversationInsightsProps {
  metrics: IntelligenceMetric[];
}

const TONE_TEXT: Record<Tone, string> = {
  positive: 'text-emerald-600',
  attention: 'text-amber-600',
  negative: 'text-rose-600',
  accent: 'text-indigo-600',
  neutral: 'text-slate-800',
};

const TONE_BAR: Record<Tone, string> = {
  positive: 'bg-emerald-500',
  attention: 'bg-amber-500',
  negative: 'bg-rose-500',
  accent: 'bg-gradient-to-r from-indigo-500 to-[#8b5cf6]',
  neutral: 'bg-slate-400',
};

export default function ConversationInsights({ metrics }: ConversationInsightsProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Conversation Intelligence</h3>
          <p className="text-slate-400 text-xs">Signals extracted by V3 AI.</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100/80">
        {metrics.map((m) => {
          const tone = m.tone ?? 'neutral';
          return (
            <div key={m.id} className="py-3.5 first:pt-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 font-medium">{m.label}</span>
                <span className={`text-sm font-bold tabular-nums ${TONE_TEXT[tone]}`}>{m.value}</span>
              </div>
              {typeof m.progress === 'number' && (
                <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${TONE_BAR[tone]}`} style={{ width: `${m.progress}%` }} />
                </div>
              )}
              {m.hint && <p className="text-[11px] text-slate-400 font-medium mt-1">{m.hint}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
