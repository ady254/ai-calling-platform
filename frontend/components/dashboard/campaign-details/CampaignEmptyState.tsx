import React from 'react';
import { Rocket, Play } from 'lucide-react';

interface CampaignEmptyStateProps {
  onLaunch?: () => void;
}

export default function CampaignEmptyState({ onLaunch }: CampaignEmptyStateProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-10 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col items-center justify-center text-center min-h-[420px]">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center mb-6">
        <Rocket className="w-8 h-8 text-indigo-500" />
      </div>

      <h3 className="text-xl font-bold text-slate-800 font-sans tracking-tight mb-2">Campaign Ready</h3>

      <p className="text-slate-400 text-sm font-medium max-w-md mb-8 leading-relaxed">
        No calls have been made yet. Launch your campaign to begin collecting performance insights.
      </p>

      <button
        onClick={onLaunch}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
      >
        <Play className="w-4 h-4" />
        Launch Campaign
      </button>
    </div>
  );
}
