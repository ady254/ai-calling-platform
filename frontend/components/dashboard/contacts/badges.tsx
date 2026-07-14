import React from 'react';
import { CRMStatus } from '@/types/contacts-crm';

// Lead score bands per spec: 90+ green · 70–89 blue · 50–69 orange · <50 gray
export function LeadScoreBadge({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  const style =
    score >= 90
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100/70'
      : score >= 70
      ? 'bg-blue-50 text-blue-700 border-blue-100/70'
      : score >= 50
      ? 'bg-amber-50 text-amber-700 border-amber-100/70'
      : 'bg-slate-100 text-slate-500 border-slate-200/70';

  const sizing = size === 'md' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center font-bold rounded-full border tabular-nums ${style} ${sizing}`}>
      {score}
    </span>
  );
}

const STATUS_STYLE: Record<CRMStatus, { label: string; cls: string; dot: string }> = {
  new: { label: 'New', cls: 'bg-slate-100 text-slate-600 border-slate-200/70', dot: 'bg-slate-400' },
  contacted: { label: 'Contacted', cls: 'bg-blue-50 text-blue-700 border-blue-100/70', dot: 'bg-blue-500' },
  interested: { label: 'Interested', cls: 'bg-indigo-50 text-indigo-700 border-indigo-100/70', dot: 'bg-indigo-500' },
  qualified: { label: 'Qualified', cls: 'bg-violet-50 text-violet-700 border-violet-100/70', dot: 'bg-violet-500' },
  booked: { label: 'Booked', cls: 'bg-amber-50 text-amber-700 border-amber-100/70', dot: 'bg-amber-500' },
  won: { label: 'Won', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100/70', dot: 'bg-emerald-500' },
  lost: { label: 'Lost', cls: 'bg-rose-50 text-rose-700 border-rose-100/70', dot: 'bg-rose-500' },
};

export function StatusBadge({ status }: { status: CRMStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function relativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}
