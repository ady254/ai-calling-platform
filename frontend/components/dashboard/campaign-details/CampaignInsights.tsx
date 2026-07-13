import React from 'react';
import { Sparkles, TrendingUp, Zap, Compass } from 'lucide-react';
import { CampaignInsightItem } from '@/types/campaign-details';

interface CampaignInsightsProps {
  insights: CampaignInsightItem[];
}

function getIcon(idx: number) {
  const cls = 'w-4 h-4 text-indigo-500';
  switch (idx % 4) {
    case 0:
      return <Sparkles className={cls} />;
    case 1:
      return <TrendingUp className={cls} />;
    case 2:
      return <Zap className={cls} />;
    default:
      return <Compass className={cls} />;
  }
}

export default function CampaignInsights({ insights }: CampaignInsightsProps) {
  return (
    <div className="bg-white/90 rounded-2xl p-6 border border-slate-200/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] flex flex-col h-full min-h-[340px]">
      <div>
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
          AI Performance Insights
        </h3>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          Patterns detected across this campaign&apos;s conversations.
        </p>

        {insights.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 font-medium">
              No insights yet. Insights appear as calls are completed.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {insights.map((insight, idx) => (
              <div
                key={insight.id}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100/50 hover:bg-slate-50 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/30 shrink-0">
                  {getIcon(idx)}
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
