import React from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { WorkflowExecution, ExecutionStatus } from '@/types/workflow-studio';

interface ExecutionTableProps {
  executions: WorkflowExecution[];
  onViewDetails: (execution: WorkflowExecution) => void;
}

const STATUS: Record<ExecutionStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  success: { label: 'Success', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100/70', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-700 border-rose-100/70', icon: <XCircle className="w-3.5 h-3.5" /> },
  running: { label: 'Running', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100/70', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
};

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export default function ExecutionTable({ executions, onViewDetails }: ExecutionTableProps) {
  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-base font-semibold text-slate-800 tracking-tight">Recent Executions</h3>
        <p className="text-slate-400 text-xs mt-1">Live runs across all active workflows.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/50">
              {['Workflow', 'Status', 'Executed', 'Duration', 'Triggered By', ''].map((h, i) => (
                <th key={i} className={`text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400 px-6 py-3 whitespace-nowrap ${i === 5 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {executions.map((ex) => {
              const s = STATUS[ex.status];
              return (
                <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-3.5 whitespace-nowrap font-semibold text-slate-700">{ex.workflowName}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
                      {s.icon}
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-medium">{timeAgo(ex.executedAt)}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-medium tabular-nums">{ex.duration}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-medium">{ex.triggeredBy}</td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-right">
                    <button
                      onClick={() => onViewDetails(ex)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 group-hover:gap-1.5 transition-all"
                    >
                      View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
