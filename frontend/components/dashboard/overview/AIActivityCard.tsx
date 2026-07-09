import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Hourglass, 
  XCircle, 
  Clock 
} from 'lucide-react';
import { AIActivityData } from '@/types/overview';

interface AIActivityCardProps {
  activity: AIActivityData;
}

export default function AIActivityCard({ activity }: AIActivityCardProps) {
  const items = [
    {
      label: 'Completed Calls',
      value: activity.completed,
      icon: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />,
      bg: 'bg-emerald-50/55',
      badgeColor: 'text-emerald-700 bg-emerald-50 border border-emerald-100/50'
    },
    {
      label: 'In Progress',
      value: activity.inProgress,
      icon: <Loader2 className="w-4.5 h-4.5 text-indigo-500 animate-spin" />,
      bg: 'bg-indigo-50/55',
      badgeColor: 'text-indigo-700 bg-indigo-50 border border-indigo-100/50'
    },
    {
      label: 'Waiting',
      value: activity.waiting,
      icon: <Hourglass className="w-4.5 h-4.5 text-amber-500" />,
      bg: 'bg-amber-50/55',
      badgeColor: 'text-amber-700 bg-amber-50 border border-amber-100/50'
    },
    {
      label: 'Failed',
      value: activity.failed,
      icon: <XCircle className="w-4.5 h-4.5 text-rose-500" />,
      bg: 'bg-rose-50/55',
      badgeColor: 'text-rose-700 bg-rose-50 border border-rose-100/50'
    },
    {
      label: 'Average Duration',
      value: activity.averageDuration,
      icon: <Clock className="w-4.5 h-4.5 text-slate-500" />,
      bg: 'bg-slate-100/70',
      badgeColor: 'text-slate-700 bg-slate-100 border border-slate-200/55'
    }
  ];

  return (
    <div className="bg-white/90 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.2)] flex flex-col justify-between h-full min-h-[320px]">
      <div>
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight mb-5">
          Operational Health
        </h3>
        
        <div className="divide-y divide-slate-100/70">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {item.label}
                </span>
              </div>
              <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
