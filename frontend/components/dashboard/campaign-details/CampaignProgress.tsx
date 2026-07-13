import React from 'react';
import { Clock, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react';
import { CampaignProgressData } from '@/types/campaign-details';

interface CampaignProgressProps {
  data: CampaignProgressData;
}

export default function CampaignProgress({ data }: CampaignProgressProps) {
  const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  const stats = [
    {
      label: 'Retry Queue',
      value: `${data.retryQueue}`,
      hint: 'contacts',
      icon: <RotateCcw className="w-4 h-4 text-amber-500" />,
      bg: 'bg-amber-50/60',
    },
    {
      label: 'Failed Calls',
      value: `${data.failedCalls}`,
      hint: 'total',
      icon: <XCircle className="w-4 h-4 text-rose-500" />,
      bg: 'bg-rose-50/60',
    },
    {
      label: 'Success Rate',
      value: `${data.successRate}%`,
      hint: 'answered',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      bg: 'bg-emerald-50/60',
    },
  ];

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col h-full min-h-[340px]">
      <div>
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
          Campaign Progress
        </h3>
        <p className="text-slate-400 text-xs mt-1">Live contact processing status.</p>
      </div>

      {/* Progress bar */}
      <div className="mt-7">
        <div className="flex items-end justify-between mb-2.5">
          <span className="text-sm font-medium text-slate-600">
            <span className="text-slate-800 font-semibold">{data.completed.toLocaleString()}</span>
            {' / '}
            {data.total.toLocaleString()} contacts completed
          </span>
          <span className="text-lg font-semibold text-slate-800 tabular-nums">{pct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-[#8b5cf6] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs font-medium text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Estimated completion · <span className="text-slate-600 font-semibold">{data.etaLabel}</span>
          </span>
        </div>
      </div>

      {/* Sub-stats */}
      <div className="mt-auto pt-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-100 p-3.5 flex flex-col gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-semibold text-slate-800 tracking-tight tabular-nums">{s.value}</div>
              <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                {s.label}
                <span className="hidden sm:inline"> · {s.hint}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
