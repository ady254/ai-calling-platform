import React from 'react';
import { Pause, Play, Copy, Download, Loader2 } from 'lucide-react';
import { CampaignHeaderData, CampaignRunStatus } from '@/types/campaign-details';

interface CampaignHeaderProps {
  data: CampaignHeaderData;
  busy?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
}

const STATUS_CONFIG: Record<
  CampaignRunStatus,
  { label: string; dot: string; text: string; bg: string; pulse: boolean }
> = {
  running: { label: 'Running', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100/70', pulse: true },
  paused: { label: 'Paused', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-100/70', pulse: false },
  scheduled: { label: 'Scheduled', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-100/70', pulse: false },
  completed: { label: 'Completed', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200/70', pulse: false },
  draft: { label: 'Draft', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200/70', pulse: false },
  cancelled: { label: 'Cancelled', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-100/70', pulse: false },
};

const formatCreated = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
};

function HeaderButton({
  icon,
  label,
  onClick,
  emphasis = false,
  loading = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  emphasis?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
        emphasis
          ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      <span>{label}</span>
    </button>
  );
}

export default function CampaignHeader({
  data,
  busy = false,
  onPause,
  onResume,
  onDuplicate,
  onExport,
}: CampaignHeaderProps) {
  const status = STATUS_CONFIG[data.status];
  const isRunning = data.status === 'running';

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between pb-6 border-b border-slate-100">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-800 tracking-tight font-sans truncate">
            {data.name}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.text}`}
          >
            <span className="relative flex h-2 w-2">
              {status.pulse && (
                <span className={`absolute inline-flex h-full w-full rounded-full ${status.dot} opacity-60 animate-ping`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
            </span>
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-slate-400 font-medium">
          <span>Created {formatCreated(data.createdAt)}</span>
          <span className="hidden sm:inline text-slate-200">•</span>
          <span>Last updated {formatRelative(data.updatedAt)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {isRunning ? (
          <HeaderButton icon={<Pause className="w-4 h-4" />} label="Pause Campaign" onClick={onPause} emphasis loading={busy} />
        ) : (
          <HeaderButton icon={<Play className="w-4 h-4" />} label="Resume Campaign" onClick={onResume} emphasis loading={busy} />
        )}
        <HeaderButton icon={<Copy className="w-4 h-4" />} label="Duplicate" onClick={onDuplicate} disabled={busy} />
        <HeaderButton icon={<Download className="w-4 h-4" />} label="Export Report" onClick={onExport} disabled={busy} />
      </div>
    </header>
  );
}
