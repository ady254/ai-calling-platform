import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FunnelStage } from '@/types/analytics';

interface ExecutiveFunnelProps {
  stages: FunnelStage[];
}

export default function ExecutiveFunnel({ stages }: ExecutiveFunnelProps) {
  const max = stages.length > 0 ? stages[0].value : 1;
  const overall =
    stages.length > 1 && stages[0].value > 0
      ? ((stages[stages.length - 1].value / stages[0].value) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Executive Funnel</h3>
          <p className="text-slate-400 text-xs mt-1">From imported lead to closed customer.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-slate-800 tracking-tight tabular-nums">{overall}%</div>
          <div className="text-[11px] text-slate-400 font-medium">lead → customer</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {stages.map((stage, idx) => {
          const width = Math.max((stage.value / max) * 100, 22);
          const opacity = 1 - idx * (0.48 / Math.max(stages.length - 1, 1));
          const prev = idx > 0 ? stages[idx - 1] : null;
          const stepPct = prev && prev.value > 0 ? ((stage.value / prev.value) * 100).toFixed(1) : null;

          return (
            <div key={stage.id}>
              {stepPct && (
                <div className="flex items-center justify-center gap-1.5 py-1.5">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[11px] font-semibold text-slate-500 tabular-nums">{stepPct}%</span>
                </div>
              )}
              <div className="flex justify-center">
                <div
                  className="relative rounded-xl h-14 flex items-center justify-between px-5 text-white overflow-hidden transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(135deg, rgba(99,102,241,${opacity}), rgba(139,92,246,${opacity}))`,
                  }}
                >
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  <span className="text-sm font-semibold tracking-tight truncate relative">{stage.label}</span>
                  <span className="text-base font-bold tabular-nums relative">{stage.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
