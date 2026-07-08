import React from 'react';
import { Sparkles, TrendingUp, Compass, Zap } from 'lucide-react';
import { AIInsightData } from '@/types/overview';

interface AIInsightsProps {
  insights: AIInsightData[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  // Use different matching icons for variety and premium style
  const getInsightIcon = (idx: number) => {
    const iconClass = "w-4 h-4 text-indigo-500";
    switch (idx % 4) {
      case 0:
        return <Sparkles className={iconClass} />;
      case 1:
        return <TrendingUp className={iconClass} />;
      case 2:
        return <Zap className={iconClass} />;
      case 3:
        return <Compass className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col h-full min-h-[340px]">
      <div>
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
          AI Insights
        </h3>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          AI generated recommendations to optimize conversion and reach.
        </p>

        {insights.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 font-medium">No insights generated yet. Launch campaigns to receive suggestions.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {insights.map((insight, idx) => (
              <div 
                key={insight.id}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100/50 hover:bg-slate-50 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/30 shrink-0">
                  {getInsightIcon(idx)}
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed font-sans pt-0.5">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
