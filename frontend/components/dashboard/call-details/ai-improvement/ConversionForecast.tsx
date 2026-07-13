import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { ConversionForecastData } from '@/types/call-details';

interface ConversionForecastProps {
  data: ConversionForecastData;
}

export default function ConversionForecast({ data }: ConversionForecastProps) {
  const upliftPts = +(data.projectedRate - data.currentRate).toFixed(1);
  const upliftPct =
    data.currentRate > 0 ? Math.round(((data.projectedRate - data.currentRate) / data.currentRate) * 100) : 0;
  const maxRate = Math.max(data.currentRate, data.projectedRate, 1);

  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Expected Improvement in Conversion</h3>
          <p className="text-slate-400 text-xs">{data.basis}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        {/* Numbers */}
        <div className="lg:col-span-2 flex items-center gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current</div>
            <div className="text-3xl font-bold text-slate-800 tracking-tight tabular-nums">{data.currentRate}%</div>
          </div>
          <ArrowRightIcon />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Projected</div>
            <div className="text-3xl font-bold text-indigo-600 tracking-tight tabular-nums">{data.projectedRate}%</div>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100/70 self-start">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{upliftPts} pts
          </span>
        </div>

        {/* Before / after bars */}
        <div className="lg:col-span-3 space-y-3">
          <BarRow label="Current" value={data.currentRate} max={maxRate} tone="slate" />
          <BarRow label="With v2" value={data.projectedRate} max={maxRate} tone="indigo" />
          <p className="text-xs text-slate-400 font-medium pt-1">
            Estimated <span className="text-emerald-600 font-semibold">+{upliftPct}%</span> relative lift in answered → qualified rate.
          </p>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: 'slate' | 'indigo' }) {
  const width = `${(value / max) * 100}%`;
  const fill = tone === 'indigo' ? 'bg-gradient-to-r from-indigo-500 to-[#8b5cf6]' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-slate-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-6 rounded-lg bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-lg ${fill} transition-all duration-700`} style={{ width }} />
      </div>
      <span className="text-sm font-bold text-slate-700 tabular-nums w-12 text-right">{value}%</span>
    </div>
  );
}
