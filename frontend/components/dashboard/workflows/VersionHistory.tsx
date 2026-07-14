import React from 'react';
import { History, RotateCcw, GitCompare } from 'lucide-react';
import { WorkflowVersion } from '@/types/workflow-studio';

interface VersionHistoryProps {
  versions: WorkflowVersion[];
  onRestore: (version: WorkflowVersion) => void;
  onCompare: (version: WorkflowVersion) => void;
}

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function VersionHistory({ versions, onRestore, onCompare }: VersionHistoryProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
          <History className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">Version History</h3>
          <p className="text-slate-400 text-xs">Every change is versioned and restorable.</p>
        </div>
      </div>

      <div className="relative pl-3 border-l-2 border-slate-100 space-y-5 ml-2">
        {versions.map((v) => (
          <div key={v.id} className="relative">
            <div className={`absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${v.current ? 'bg-indigo-500' : 'bg-slate-300'}`} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{v.label}</span>
                  {v.current && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/70 rounded px-1.5 py-0.5">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-tight mt-1">{v.note}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{v.author} · {timeAgo(v.date)}</p>
              </div>
              {!v.current && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onCompare(v)}
                    title="Compare changes"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <GitCompare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRestore(v)}
                    title="Restore version"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
