import React from 'react';
import { ThumbsUp, Lightbulb, Wand2, Check, ArrowUpRight } from 'lucide-react';
import { CoachingData } from '@/types/call-details';

interface ConversationCoachingProps {
  data: CoachingData;
  onCreateImprovedPrompt?: () => void;
}

export default function ConversationCoaching({ data, onCreateImprovedPrompt }: ConversationCoachingProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Conversation Coaching</h3>
        <p className="text-slate-400 text-xs mt-1">Feedback to improve the AI agent over time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* What AI did well */}
        <div className="rounded-xl border border-emerald-100/70 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-semibold text-slate-800">What AI Did Well</h4>
          </div>
          <ul className="space-y-2">
            {data.didWell.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Needs improvement */}
        <div className="rounded-xl border border-amber-100/70 bg-amber-50/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-semibold text-slate-800">Needs Improvement</h4>
          </div>
          <ul className="space-y-2">
            {data.needsImprovement.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested prompt improvement */}
      <div className="rounded-xl border border-indigo-100/70 bg-indigo-50/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-semibold text-slate-800">Suggested Prompt Improvement</h4>
        </div>
        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">{data.suggestedPrompt}</p>
        <button
          onClick={onCreateImprovedPrompt}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
        >
          <ArrowUpRight className="w-4 h-4" />
          Create Improved Prompt
        </button>
      </div>
    </div>
  );
}
