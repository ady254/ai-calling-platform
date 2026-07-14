import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface AIRecommendationsProps {
  recommendations: string[];
  conversionProbability: number; // 0-100
}

export default function AIRecommendations({ recommendations, conversionProbability }: AIRecommendationsProps) {
  return (
    <div className="rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/70 to-white p-5 relative overflow-hidden">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white border border-indigo-100/60 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 tracking-tight">AI Recommendations</h4>
      </div>

      <ul className="space-y-2.5 mb-5">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            {rec}
          </li>
        ))}
      </ul>

      {/* Conversion probability */}
      <div className="rounded-xl bg-white border border-indigo-100/60 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            Estimated conversion probability
          </span>
          <span className="text-lg font-bold text-slate-800 tabular-nums">{conversionProbability}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#8b5cf6]"
            style={{ width: `${conversionProbability}%` }}
          />
        </div>
      </div>
    </div>
  );
}
