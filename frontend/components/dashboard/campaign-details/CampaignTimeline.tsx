import React from 'react';
import { CheckCircle2, AlertTriangle, Info, Circle } from 'lucide-react';
import { CampaignTimelineItem } from '@/types/campaign-details';

interface CampaignTimelineProps {
  items: CampaignTimelineItem[];
}

function renderNode(type: CampaignTimelineItem['type']) {
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
          <Circle className="w-4 h-4 text-slate-400" />
        </div>
      );
  }
}

export default function CampaignTimeline({ items }: CampaignTimelineProps) {
  return (
    <div className="bg-white/90 rounded-2xl p-6 border border-slate-200/70 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.18)] flex flex-col h-full min-h-[340px]">
      <div>
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
          Recent Campaign Activity
        </h3>
        <p className="text-slate-400 text-xs mt-1 mb-6">Latest events from this campaign.</p>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 font-medium">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="relative pl-3 border-l-2 border-slate-100/80 space-y-6 ml-2.5">
            {items.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4">
                <div className="absolute -left-[27.5px] top-0.5 bg-white">{renderNode(item.type)}</div>
                <div className="flex-1 flex items-start justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{item.title}</span>
                  <span className="text-xs text-slate-400 font-medium shrink-0 whitespace-nowrap pt-0.5">
                    {item.time}
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
