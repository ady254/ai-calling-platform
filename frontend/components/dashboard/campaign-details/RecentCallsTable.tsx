import React from 'react';
import { ArrowRight } from 'lucide-react';
import { RecentCall, CallOutcome, CallSentiment } from '@/types/campaign-details';

interface RecentCallsTableProps {
  calls: RecentCall[];
  onViewDetails?: (id: string) => void;
}

const OUTCOME_STYLE: Record<CallOutcome, string> = {
  Qualified: 'bg-emerald-50 text-emerald-700 border-emerald-100/70',
  Appointment: 'bg-indigo-50 text-indigo-700 border-indigo-100/70',
  Callback: 'bg-amber-50 text-amber-700 border-amber-100/70',
  'Not Interested': 'bg-rose-50 text-rose-700 border-rose-100/70',
  Voicemail: 'bg-slate-100 text-slate-600 border-slate-200/70',
  'No Answer': 'bg-slate-100 text-slate-600 border-slate-200/70',
};

const SENTIMENT_STYLE: Record<CallSentiment, { dot: string; text: string }> = {
  Positive: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  Neutral: { dot: 'bg-slate-400', text: 'text-slate-600' },
  Negative: { dot: 'bg-rose-500', text: 'text-rose-700' },
};

function scoreColor(score: number) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700' };
  return { bar: 'bg-rose-500', text: 'text-rose-600' };
}

export default function RecentCallsTable({ calls, onViewDetails }: RecentCallsTableProps) {
  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] overflow-hidden">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Recent Calls</h3>
          <p className="text-slate-400 text-xs mt-1">Latest conversations handled by the AI agent.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/50">
              {['Customer', 'Duration', 'Outcome', 'Lead Score', 'Sentiment', 'Next Action', ''].map((h, i) => (
                <th
                  key={i}
                  className={`text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400 px-6 py-3 whitespace-nowrap ${
                    i === 6 ? 'text-right' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {calls.map((call) => {
              const sc = scoreColor(call.leadScore);
              const sentiment = SENTIMENT_STYLE[call.sentiment];
              return (
                <tr key={call.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                        {call.customer
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span className="font-semibold text-slate-700">{call.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium tabular-nums">
                    {call.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${OUTCOME_STYLE[call.outcome]}`}
                    >
                      {call.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${call.leadScore}%` }} />
                      </div>
                      <span className={`text-sm font-semibold tabular-nums ${sc.text}`}>{call.leadScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${sentiment.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sentiment.dot}`} />
                      {call.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{call.nextAction}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onViewDetails?.(call.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 group-hover:gap-1.5 transition-all"
                    >
                      View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
