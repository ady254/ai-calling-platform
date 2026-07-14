import React from 'react';
import { MessageSquareWarning, HelpCircle, Clock, Building2 } from 'lucide-react';
import { CustomerInsightsData } from '@/types/analytics';

interface CustomerInsightsProps {
  data: CustomerInsightsData;
}

function RankedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 tabular-nums">
            {i + 1}
          </span>
          <span className="text-sm font-medium text-slate-700">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">{icon}</div>
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function CustomerInsights({ data }: CustomerInsightsProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight mb-4">Customer Insights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card icon={<MessageSquareWarning className="w-4 h-4 text-indigo-500" />} title="Most Common Objections">
          <RankedList items={data.objections} />
        </Card>
        <Card icon={<HelpCircle className="w-4 h-4 text-indigo-500" />} title="Most Asked Questions">
          <RankedList items={data.questions} />
        </Card>
        <Card icon={<Clock className="w-4 h-4 text-indigo-500" />} title="Best Calling Hours">
          <div className="flex flex-col items-start justify-center h-full pt-2">
            <span className="text-3xl font-bold text-slate-800 tracking-tight">{data.bestHours.window}</span>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {data.bestHours.note}
            </span>
          </div>
        </Card>
        <Card icon={<Building2 className="w-4 h-4 text-indigo-500" />} title="Top Industries">
          <RankedList items={data.topIndustries} />
        </Card>
      </div>
    </div>
  );
}
