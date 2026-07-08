import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { RecentActivityData } from '@/types/overview';

interface RecentActivityProps {
  activities: RecentActivityData[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const renderIcon = (type: RecentActivityData['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100/50">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
        );
      case 'info':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
            <Info className="w-4 h-4 text-blue-500" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-slate-500" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col h-full min-h-[340px]">
      <div>
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
          Recent AI Activity
        </h3>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          Latest business events from active campaigns.
        </p>

        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 font-medium">No recent activities available.</p>
          </div>
        ) : (
          <div className="relative pl-3 border-l-2 border-slate-100/80 space-y-6 ml-2.5">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex items-start gap-4">
                {/* Timeline node */}
                <div className="absolute -left-[27.5px] top-0.5 bg-white">
                  {renderIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-slate-700 leading-tight">
                      {activity.title}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {activity.campaign}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium shrink-0 whitespace-nowrap pt-0.5">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
