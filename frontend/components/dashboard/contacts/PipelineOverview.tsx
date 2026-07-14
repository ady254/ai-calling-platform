import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PipelineStage } from '@/types/contacts-crm';

interface PipelineOverviewProps {
  stages: PipelineStage[];
  activeStage: string | null;
  onSelect: (stageId: string) => void;
}

export default function PipelineOverview({ stages, activeStage, onSelect }: PipelineOverviewProps) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Pipeline Overview</h3>
          <p className="text-slate-400 text-xs mt-0.5">Click a stage to filter the table.</p>
        </div>
        {activeStage && (
          <button
            onClick={() => onSelect(activeStage)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Clear stage
          </button>
        )}
      </div>

      <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
        {stages.map((stage, i) => {
          const active = activeStage === stage.id;
          const intensity = 0.15 + (stage.count / max) * 0.85;
          return (
            <React.Fragment key={stage.id}>
              <button
                onClick={() => onSelect(stage.id)}
                className={`group relative flex-1 min-w-[120px] text-left rounded-xl border p-3.5 transition-all duration-200 ${
                  active
                    ? 'border-indigo-300 bg-indigo-50/70 ring-1 ring-indigo-200'
                    : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: `rgba(99,102,241,${intensity})` }}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{stage.label}</span>
                </div>
                <div className={`text-xl font-bold tracking-tight tabular-nums mt-1.5 ${active ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {stage.count.toLocaleString()}
                </div>
                {/* proportion bar */}
                <div className="mt-2 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#8b5cf6]"
                    style={{ width: `${(stage.count / max) * 100}%` }}
                  />
                </div>
              </button>
              {i < stages.length - 1 && (
                <div className="flex items-center text-slate-300 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
