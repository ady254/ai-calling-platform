import React from 'react';
import { Sparkles, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react';
import { Recommendation, RecommendationTone } from '@/types/analytics';

interface StrategicRecommendationsProps {
  recommendations: Recommendation[];
}

const TONE: Record<RecommendationTone, { icon: React.ReactNode; bg: string }> = {
  positive: { icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50 border-emerald-100/50' },
  info: { icon: <Lightbulb className="w-4 h-4 text-indigo-500" />, bg: 'bg-indigo-50 border-indigo-100/50' },
  warning: { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50 border-amber-100/50' },
};

export default function StrategicRecommendations({ recommendations }: StrategicRecommendationsProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">AI Strategic Recommendations</h3>
          <p className="text-slate-400 text-xs">Decisions the data suggests you make next.</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec) => {
          const tone = TONE[rec.tone ?? 'info'];
          return (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-all"
            >
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${tone.bg}`}>{tone.icon}</div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed pt-0.5">{rec.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
