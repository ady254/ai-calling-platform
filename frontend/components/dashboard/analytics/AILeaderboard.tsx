import React from 'react';
import { AgentRow } from '@/types/analytics';

interface AILeaderboardProps {
  agents: AgentRow[];
}

function rankStyle(rank: number) {
  if (rank === 1) return 'bg-amber-50 text-amber-700 border-amber-200/70';
  if (rank === 2) return 'bg-slate-100 text-slate-600 border-slate-200/70';
  if (rank === 3) return 'bg-orange-50 text-orange-700 border-orange-100/70';
  return 'bg-slate-50 text-slate-500 border-slate-200/60';
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  return 'text-amber-600';
}

export default function AILeaderboard({ agents }: AILeaderboardProps) {
  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] overflow-hidden">
      <div className="p-6 pb-4">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">AI Workforce Performance</h3>
        <p className="text-slate-400 text-xs mt-1">Your AI agents, ranked by output and quality.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/50">
              {['#', 'Agent', 'Calls', 'Meetings', 'Conversion', 'Sentiment', 'Lead Score', 'Avg Duration'].map((h, i) => (
                <th key={i} className={`text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-5 py-3 whitespace-nowrap ${i <= 1 ? 'text-left' : 'text-right'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {agents.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${rankStyle(a.rank)}`}>
                    {a.rank}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-slate-700">{a.name}</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-600 tabular-nums">{a.calls.toLocaleString()}</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-600 tabular-nums">{a.meetings}</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right font-semibold text-slate-700 tabular-nums">{a.conversion}%</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {a.sentiment}%
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right">
                  <span className={`font-bold tabular-nums ${scoreColor(a.leadScore)}`}>{a.leadScore}</span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-right font-medium text-slate-500 tabular-nums">{a.avgDuration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
