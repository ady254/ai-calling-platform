"use client";

import React from 'react';
import { Download, CalendarClock } from 'lucide-react';
import { DateRangeKey } from '@/types/analytics';

interface AnalyticsHeaderProps {
  title?: string;
  subtitle?: string;
  range: DateRangeKey;
  onRangeChange: (range: DateRangeKey) => void;
  onExport?: () => void;
  onSchedule?: () => void;
}

const RANGES: { key: DateRangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: 'custom', label: 'Custom' },
];

export default function AnalyticsHeader({
  title = 'Executive Analytics',
  subtitle = 'Measure AI performance, business growth and operational efficiency.',
  range,
  onRangeChange,
  onExport,
  onSchedule,
}: AnalyticsHeaderProps) {
  return (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold text-slate-800 tracking-tight font-sans">{title}</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Date range segmented control */}
        <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/40 self-start">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => onRangeChange(r.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                range === r.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={onSchedule}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
          >
            <CalendarClock className="w-4 h-4" />
            Schedule Report
          </button>
        </div>
      </div>
    </header>
  );
}
