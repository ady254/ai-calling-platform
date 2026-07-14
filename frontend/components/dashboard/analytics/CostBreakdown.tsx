"use client";

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CostBreakdownData } from '@/types/analytics';

interface CostBreakdownProps {
  data: CostBreakdownData;
}

// Restrained sequential ramp (largest → smallest), on-brand indigo → slate.
const PALETTE = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#cbd5e1'];

export default function CostBreakdown({ data }: CostBreakdownProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const total = data.slices.reduce((s, x) => s + x.value, 0);
  const chartData = data.slices.map((s, i) => ({ ...s, color: PALETTE[i % PALETTE.length] }));

  const Tip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-slate-900 rounded-xl p-2.5 shadow-xl text-white text-xs">
          <span className="font-semibold">{p.label}</span>
          <span className="text-slate-300"> · ${p.value} · {((p.value / total) * 100).toFixed(0)}%</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full">
      <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Cost Breakdown</h3>
      <p className="text-slate-400 text-xs mt-1 mb-4">{data.caption ?? 'Monthly AI cost'} by service.</p>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative w-40 h-40 shrink-0">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none">
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{data.total}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">/ month</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {chartData.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium text-slate-600 truncate">{s.label}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-slate-700 tabular-nums">${s.value}</span>
                <span className="text-[11px] text-slate-400 font-medium tabular-nums w-8 text-right">{((s.value / total) * 100).toFixed(0)}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
