import React from 'react';
import { Crown } from 'lucide-react';
import { CampaignRow } from '@/types/analytics';

interface CampaignRankingProps {
  campaigns: CampaignRow[];
}

function money(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
}

export default function CampaignRanking({ campaigns }: CampaignRankingProps) {
  const maxRoi = Math.max(...campaigns.map((c) => c.roi), 1);

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col h-full min-h-[420px] overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Campaign Performance Ranking</h3>
        <p className="text-slate-400 text-xs mt-1">Ranked by ROI across active campaigns.</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/50">
              {['Campaign', 'Conv.', 'Revenue', 'Meetings', 'Cost', 'ROI'].map((h, i) => (
                <th key={i} className={`text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-4 py-2.5 whitespace-nowrap ${i === 0 ? 'text-left' : 'text-right'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {campaigns.map((c) => (
              <tr key={c.id} className={`transition-colors ${c.top ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 max-w-[220px]">
                    {c.top && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                    <span className={`font-semibold truncate ${c.top ? 'text-indigo-700' : 'text-slate-700'}`}>{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-600 tabular-nums">{c.conversion}%</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-slate-700 tabular-nums">{money(c.revenue)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-600 tabular-nums">{c.meetings}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-500 tabular-nums">${c.cost}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#8b5cf6]" style={{ width: `${(c.roi / maxRoi) * 100}%` }} />
                    </div>
                    <span className={`font-bold tabular-nums ${c.top ? 'text-indigo-700' : 'text-slate-700'}`}>{c.roi}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
