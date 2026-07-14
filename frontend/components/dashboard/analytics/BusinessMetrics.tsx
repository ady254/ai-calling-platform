import React from 'react';
import { LineChart, Award, Heart, Users, ArrowUpRight } from 'lucide-react';
import { BusinessMetric, BusinessMetricIcon } from '@/types/analytics';

interface BusinessMetricsProps {
  metrics: BusinessMetric[];
}

function renderIcon(icon: BusinessMetricIcon) {
  const cls = 'w-4 h-4 text-indigo-500';
  switch (icon) {
    case 'forecast':
      return <LineChart className={cls} />;
    case 'quality':
      return <Award className={cls} />;
    case 'satisfaction':
      return <Heart className={cls} />;
    case 'efficiency':
      return <Users className={cls} />;
    default:
      return <LineChart className={cls} />;
  }
}

export default function BusinessMetrics({ metrics }: BusinessMetricsProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight mb-4">Business Intelligence</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col min-h-[160px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">{renderIcon(m.icon)}</div>
              {m.change && m.trend === 'up' && (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {m.change}
                </span>
              )}
            </div>
            <div className="mt-auto pt-4">
              {m.caption && <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{m.caption}</span>}
              <div className="text-2xl font-bold text-slate-800 tracking-tight mt-0.5">{m.value}</div>
              <div className="text-sm font-medium text-slate-500 mt-0.5">{m.label}</div>
              {m.sublabel && <div className="text-[11px] text-slate-400 font-medium mt-1">{m.sublabel}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
