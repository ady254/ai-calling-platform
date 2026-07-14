"use client";

import React from 'react';
import { User, Clock, Repeat2, CheckCircle2, Timer, PencilLine, BrainCircuit, ArrowRight, Check } from 'lucide-react';
import { Workflow, WorkflowStatus } from '@/types/workflow-studio';

interface WorkflowDetailsProps {
  workflow: Workflow;
  onToggleLearning: (enabled: boolean) => void;
}

const STATUS_STYLE: Record<WorkflowStatus, { label: string; cls: string; dot: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100/70', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', cls: 'bg-amber-50 text-amber-700 border-amber-100/70', dot: 'bg-amber-500' },
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 border-slate-200/70', dot: 'bg-slate-400' },
};

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3.5">
      <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-semibold text-slate-800 tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

export default function WorkflowDetails({ workflow, onToggleLearning }: WorkflowDetailsProps) {
  const status = STATUS_STYLE[workflow.status];

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight truncate">{workflow.name}</h3>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1.5 max-w-2xl">{workflow.description}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<Repeat2 className="w-3.5 h-3.5" />} label="Runs" value={workflow.runs.toLocaleString()} />
        <Stat icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Success" value={`${workflow.successRate}%`} />
        <Stat icon={<Timer className="w-3.5 h-3.5" />} label="Avg Duration" value={workflow.avgDuration} />
        <Stat icon={<User className="w-3.5 h-3.5" />} label="Created By" value={workflow.createdBy} />
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <PencilLine className="w-3.5 h-3.5" />
          Last modified {timeAgo(workflow.lastModified)}
        </span>
      </div>

      {/* ── AI Employee Memory ─────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/60 to-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100/60 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-800">AI Employee Memory</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100/70 rounded px-1.5 py-0.5">
                  Adaptive
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Learns from every execution and adapts future runs automatically — turning a static automation into an
                employee that improves over time.
              </p>
            </div>
          </div>

          {/* Learn toggle */}
          <button
            onClick={() => onToggleLearning(!workflow.learnFromExecutions)}
            className="flex items-center gap-2 shrink-0"
            role="switch"
            aria-checked={workflow.learnFromExecutions}
          >
            <span
              className={`relative w-10 h-6 rounded-full transition-colors ${
                workflow.learnFromExecutions ? 'bg-indigo-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  workflow.learnFromExecutions ? 'translate-x-4' : ''
                }`}
              />
            </span>
          </button>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer" onClick={() => onToggleLearning(!workflow.learnFromExecutions)}>
          <span
            className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-all ${
              workflow.learnFromExecutions ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'
            }`}
          >
            {workflow.learnFromExecutions && <Check className="w-3 h-3" />}
          </span>
          <span className="text-sm font-medium text-slate-700">Learn from previous executions</span>
        </label>

        {/* Learned adaptations */}
        {workflow.learnFromExecutions && workflow.memory.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Learned adaptations</div>
            {workflow.memory.map((m) => (
              <div key={m.id} className="flex items-center gap-2 flex-wrap rounded-xl border border-slate-100 bg-white p-3 text-sm">
                <span className="font-semibold text-slate-700">{m.source}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-500 font-medium">{m.observation}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  {m.adaptation}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
