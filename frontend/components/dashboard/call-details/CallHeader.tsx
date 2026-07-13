import React from 'react';
import { Play, Download, Share2, Building2, Phone, Megaphone, Clock, Calendar } from 'lucide-react';
import { CallHeaderData, CallStatus } from '@/types/call-details';

interface CallHeaderProps {
  data: CallHeaderData;
  onReplay?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const STATUS_CONFIG: Record<CallStatus, { label: string; text: string; bg: string; dot: string }> = {
  completed: { label: 'Completed', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100/70', dot: 'bg-emerald-500' },
  'in-progress': { label: 'In Progress', text: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100/70', dot: 'bg-indigo-500' },
  failed: { label: 'Failed', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-100/70', dot: 'bg-rose-500' },
  'no-answer': { label: 'No Answer', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200/70', dot: 'bg-slate-400' },
  voicemail: { label: 'Voicemail', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-100/70', dot: 'bg-amber-500' },
};

function HeaderButton({
  icon,
  label,
  onClick,
  emphasis = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 active:scale-[0.98] ${
        emphasis
          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-slate-300">{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-600 truncate">{value}</span>
    </div>
  );
}

export default function CallHeader({ data, onReplay, onDownload, onShare }: CallHeaderProps) {
  const status = STATUS_CONFIG[data.status];
  const dateLabel = new Date(data.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const initials = data.customerName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] p-6 sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/60 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight font-sans truncate">
                {data.customerName}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <Meta icon={<Building2 className="w-3.5 h-3.5" />} label="Company" value={data.company} />
              <Meta icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={data.phone} />
              <Meta icon={<Megaphone className="w-3.5 h-3.5" />} label="Campaign" value={data.campaign} />
              <div className="flex items-center gap-5">
                <Meta icon={<Clock className="w-3.5 h-3.5" />} label="Duration" value={data.durationLabel} />
                <Meta icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={dateLabel} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <HeaderButton icon={<Play className="w-4 h-4" />} label="Replay Recording" onClick={onReplay} emphasis />
          <HeaderButton icon={<Download className="w-4 h-4" />} label="Download Transcript" onClick={onDownload} />
          <HeaderButton icon={<Share2 className="w-4 h-4" />} label="Share" onClick={onShare} />
        </div>
      </div>
    </header>
  );
}
