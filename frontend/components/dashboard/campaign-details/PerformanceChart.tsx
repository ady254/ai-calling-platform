"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { CampaignChartPoint } from '@/types/campaign-details';

interface PerformanceChartProps {
  data: CampaignChartPoint[];
}

type MetricType = 'calls' | 'conversions' | 'appointments' | 'revenue';
type TimeRangeType = 7 | 30 | 90;

const METRIC_CONFIG: Record<
  MetricType,
  { label: string; color: string; gradientId: string; formatter: (v: number) => string }
> = {
  calls: { label: 'Calls', color: '#6366f1', gradientId: 'cdColorCalls', formatter: (v) => v.toLocaleString() },
  conversions: { label: 'Conversions', color: '#8b5cf6', gradientId: 'cdColorConv', formatter: (v) => v.toLocaleString() },
  appointments: { label: 'Appointments', color: '#ec4899', gradientId: 'cdColorAppt', formatter: (v) => v.toLocaleString() },
  revenue: { label: 'Revenue', color: '#10b981', gradientId: 'cdColorRev', formatter: (v) => `$${v.toLocaleString()}` },
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricType>('calls');
  const [timeRange, setTimeRange] = useState<TimeRangeType>(30);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)] h-full min-h-[340px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  const filteredData = data.slice(-timeRange);
  const currentConfig = METRIC_CONFIG[activeMetric];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-xl text-white font-sans text-xs">
          <p className="font-semibold text-slate-400 mb-1">{payload[0].payload.date}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentConfig.color }} />
            <span className="font-medium text-slate-300">{currentConfig.label}:</span>
            <span className="font-bold text-white">{currentConfig.formatter(payload[0].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-slate-50/70 rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)] ring-1 ring-slate-100/80 flex flex-col h-full min-h-[340px]">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
            Performance Timeline
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {currentConfig.label} over the last {timeRange} days
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Metric dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-xl border border-slate-200/50 transition-colors min-w-[120px] justify-between"
            >
              <span>{currentConfig.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5">
                {(Object.keys(METRIC_CONFIG) as MetricType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setActiveMetric(m);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                      activeMetric === m ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: METRIC_CONFIG[m].color }} />
                    {METRIC_CONFIG[m].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time range segmented control */}
          <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/20">
            {([7, 30, 90] as TimeRangeType[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  timeRange === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
            <span className="px-1.5 text-[11px] font-medium text-slate-400 select-none">Days</span>
          </div>
        </div>
      </div>

      {/* Chart canvas */}
      <div className="flex-1 w-full min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              dy={10}
              minTickGap={24}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={currentConfig.formatter}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              dx={-5}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={currentConfig.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${currentConfig.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
