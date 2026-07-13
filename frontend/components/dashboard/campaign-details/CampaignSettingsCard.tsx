import React from 'react';
import {
  Mic,
  Languages,
  RotateCcw,
  BookOpen,
  FileCode2,
  CalendarClock,
  Globe,
} from 'lucide-react';
import { CampaignSettingsData } from '@/types/campaign-details';

interface CampaignSettingsCardProps {
  settings: CampaignSettingsData;
}

export default function CampaignSettingsCard({ settings }: CampaignSettingsCardProps) {
  const rows = [
    { label: 'Voice', value: settings.voice, icon: <Mic className="w-4 h-4 text-indigo-500" /> },
    { label: 'Language', value: settings.language, icon: <Languages className="w-4 h-4 text-indigo-500" /> },
    { label: 'Retries', value: settings.retries, icon: <RotateCcw className="w-4 h-4 text-indigo-500" /> },
    { label: 'Knowledge Base', value: settings.knowledgeBase, icon: <BookOpen className="w-4 h-4 text-indigo-500" /> },
    { label: 'Prompt Version', value: settings.promptVersion, icon: <FileCode2 className="w-4 h-4 text-indigo-500" /> },
    { label: 'Launch Schedule', value: settings.launchSchedule, icon: <CalendarClock className="w-4 h-4 text-indigo-500" /> },
    { label: 'Timezone', value: settings.timezone, icon: <Globe className="w-4 h-4 text-indigo-500" /> },
  ];

  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
            Campaign Settings Summary
          </h3>
          <p className="text-slate-400 text-xs mt-1">Read-only configuration for this campaign.</p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          Read only
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              {row.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{row.label}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{row.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
