import React from 'react';
import { Sparkles, TrendingUp, Zap, Lightbulb } from 'lucide-react';
import { WorkflowRecommendation } from '@/types/workflow-studio';

interface AIRecommendationsProps {
  recommendations: WorkflowRecommendation[];
}

function icon(idx: number) {
  const cls = 'w-4 h-4 text-indigo-500';
  switch (idx % 4) {
    case 0:
      return <Lightbulb className={cls} />;
    case 1:
      return <TrendingUp className={cls} />;
    case 2:
      return <Zap className={cls} />;
    default:
      return <Sparkles className={cls} />;
  }
}

export default function AIRecommendations({ recommendations }: AIRecommendationsProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">AI Recommendations</h3>
          <p className="text-slate-400 text-xs">Ways to make this workflow perform better.</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, i) => (
          <div
            key={rec.id}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100/60 hover:bg-slate-50 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/40 flex items-center justify-center shrink-0">
              {icon(i)}
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed pt-0.5">{rec.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
