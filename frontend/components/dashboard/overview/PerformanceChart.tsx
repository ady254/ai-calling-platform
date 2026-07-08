"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { ChartDataPoint } from '@/types/overview';

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

type MetricType = 'calls' | 'meetings' | 'conversions' | 'revenue';
type TimeRangeType = 7 | 30 | 90;

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricType>('calls');
  const [timeRange, setTimeRange] = useState<TimeRangeType>(30);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent SSR hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle clicking outside custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-[380px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  // Filter data based on selected time range
  const filteredData = data.slice(-timeRange);

  // Metric metadata
  const metricConfig = {
    calls: {
      label: 'Calls',
      color: '#6366f1',
      gradientId: 'colorCalls',
      formatter: (val: number) => val.toLocaleString()
    },
    meetings: {
      label: 'Meetings',
      color: '#8b5cf6',
      gradientId: 'colorMeetings',
      formatter: (val: number) => val.toLocaleString()
    },
    conversions: {
      label: 'Conversions',
      color: '#ec4899',
      gradientId: 'colorConversions',
      formatter: (val: number) => val.toLocaleString()
    },
    revenue: {
      label: 'Revenue',
      color: '#10b981',
      gradientId: 'colorRevenue',
      formatter: (val: number) => `$${val.toLocaleString()}`
    }
  };

  const currentConfig = metricConfig[activeMetric];

  // Helper for displaying range in title
  const getRangeLabel = (range: TimeRangeType) => {
    switch (range) {
      case 7: return 'Last 7 Days';
      case 30: return 'Last 30 Days';
      case 90: return 'Last 90 Days';
    }
  };

  // Custom tooltips matching premium B2B UI style
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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between h-full min-h-[380px]">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
            Call Performance ({getRangeLabel(timeRange)})
          </h3>
        </div>

        {/* Dropdown & Segmented Controls */}
        <div className="flex items-center gap-3">
          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-xl border border-slate-200/50 transition-colors"
            >
              <span>{getRangeLabel(timeRange)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5">
                {([7, 30, 90] as TimeRangeType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setTimeRange(r);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                      timeRange === r 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {getRangeLabel(r)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Segmented control toggles */}
          <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/20">
            {(['calls', 'meetings', 'conversions', 'revenue'] as MetricType[]).map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  activeMetric === metric
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {metricConfig[metric].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.00} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#f1f5f9"
            />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={currentConfig.formatter}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              dx={-5}
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
