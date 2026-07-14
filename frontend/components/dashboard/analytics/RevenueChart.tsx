"use client";

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { RevenuePoint, RevenueMetric } from '@/types/analytics';

interface RevenueChartProps {
  data: RevenuePoint[];
}

const METRICS: Record<RevenueMetric, { label: string; color: string; gradientId: string; fmt: (v: number) => string }> = {
  revenue: { label: 'Revenue', color: '#6366f1', gradientId: 'anRevenue', fmt: (v) => `$${(v / 1000).toFixed(0)}k` },
  pipeline: { label: 'Pipeline', color: '#8b5cf6', gradientId: 'anPipeline', fmt: (v) => `$${(v / 1000).toFixed(0)}k` },
  meetings: { label: 'Meetings', color: '#0ea5e9', gradientId: 'anMeetings', fmt: (v) => `${v}` },
  conversions: { label: 'Conversions', color: '#10b981', gradientId: 'anConversions', fmt: (v) => `${v}` },
  cost: { label: 'Cost', color: '#64748b', gradientId: 'anCost', fmt: (v) => `$${v}` },
  roi: { label: 'ROI', color: '#6366f1', gradientId: 'anRoi', fmt: (v) => `${v}%` },
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<RevenueMetric>('revenue');
  useEffect(() => setMounted(true), []);

  const cfg = METRICS[metric];

  const Tip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl text-white text-xs">
          <p className="font-semibold text-slate-400 mb-1">{payload[0].payload.date}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
            <span className="font-medium text-slate-300">{cfg.label}:</span>
            <span className="font-bold text-white">{cfg.fmt(payload[0].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)] ring-1 ring-slate-100/80 flex flex-col h-full min-h-[420px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Revenue Trend</h3>
          <p className="text-slate-400 text-xs mt-1">{cfg.label} over the last 30 days</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-100/80 p-0.5 rounded-xl border border-slate-200/20">
          {(Object.keys(METRICS) as RevenueMetric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                metric === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {METRICS[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={cfg.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={cfg.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={cfg.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} dy={10} minTickGap={28} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={cfg.fmt} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} width={52} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey={metric} stroke={cfg.color} strokeWidth={2} fillOpacity={1} fill={`url(#${cfg.gradientId})`} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
