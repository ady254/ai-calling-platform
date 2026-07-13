import React from 'react';
import { Sparkles, Check } from 'lucide-react';

interface AISummaryProps {
  points: string[] | null; // null => still generating
}

export default function AISummary({ points }: AISummaryProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">AI Generated Summary</h3>
          <p className="text-slate-400 text-xs">Key moments distilled from the conversation.</p>
        </div>
      </div>

      {!points || points.length === 0 ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 rounded bg-slate-100 animate-pulse" style={{ width: `${90 - i * 12}%` }} />
          ))}
          <p className="text-xs text-slate-400 font-medium pt-1">Summary generating…</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {points.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100/60 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-indigo-500" />
              </span>
              <span className="text-sm text-slate-600 font-medium leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
