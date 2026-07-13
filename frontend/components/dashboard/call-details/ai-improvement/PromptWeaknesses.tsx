import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PromptWeakness, WeaknessSeverity } from '@/types/call-details';

interface PromptWeaknessesProps {
  weaknesses: PromptWeakness[];
}

const SEVERITY: Record<WeaknessSeverity, { label: string; text: string; bg: string; dot: string }> = {
  high: { label: 'High', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-100/70', dot: 'bg-rose-500' },
  medium: { label: 'Medium', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-100/70', dot: 'bg-amber-500' },
  low: { label: 'Low', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200/70', dot: 'bg-slate-400' },
};

export default function PromptWeaknesses({ weaknesses }: PromptWeaknessesProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/60 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Prompt Weaknesses Detected</h3>
          <p className="text-slate-400 text-xs">Where the current prompt limited performance.</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {weaknesses.map((w) => {
          const sev = SEVERITY[w.severity];
          return (
            <div key={w.id} className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${sev.dot}`} />
                  <h4 className="text-sm font-semibold text-slate-800">{w.title}</h4>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${sev.bg} ${sev.text}`}>
                  {sev.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1.5 pl-4">{w.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
