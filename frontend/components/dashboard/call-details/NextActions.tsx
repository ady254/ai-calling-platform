"use client";

import React, { useState } from 'react';
import { Check, UserPlus, CalendarPlus, ListChecks } from 'lucide-react';
import { NextAction } from '@/types/call-details';

interface NextActionsProps {
  actions: NextAction[];
  onToggle?: (id: string, done: boolean) => void;
  onAssign?: (id: string) => void;
  onSchedule?: (id: string) => void;
}

export default function NextActions({ actions, onToggle, onAssign, onSchedule }: NextActionsProps) {
  const [done, setDone] = useState<Record<string, boolean>>(
    () => Object.fromEntries(actions.map((a) => [a.id, !!a.done]))
  );

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      onToggle?.(id, next[id]);
      return next;
    });
  };

  const completedCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
            <ListChecks className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Next Best Actions</h3>
            <p className="text-slate-400 text-xs">AI-recommended follow-through.</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full tabular-nums">
          {completedCount}/{actions.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {actions.map((action) => {
          const isDone = done[action.id];
          return (
            <div
              key={action.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-3 hover:border-slate-200 transition-colors"
            >
              <button
                onClick={() => toggle(action.id)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-slate-300 hover:border-indigo-400'
                }`}
                aria-label="Complete"
              >
                {isDone && <Check className="w-3.5 h-3.5" />}
              </button>

              <span
                className={`flex-1 text-sm font-medium transition-colors ${
                  isDone ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}
              >
                {action.label}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAssign?.(action.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                  title="Assign"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Assign</span>
                </button>
                <button
                  onClick={() => onSchedule?.(action.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                  title="Schedule"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Schedule</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
