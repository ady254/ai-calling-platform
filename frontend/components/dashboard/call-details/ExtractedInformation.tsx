import React from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Wrench,
  Package,
  Wallet,
  CalendarClock,
  UserCog,
} from 'lucide-react';
import { ExtractedField, ExtractedIcon } from '@/types/call-details';

interface ExtractedInformationProps {
  fields: ExtractedField[];
}

function renderIcon(icon: ExtractedIcon) {
  const cls = 'w-4 h-4 text-indigo-500';
  switch (icon) {
    case 'company':
      return <Building2 className={cls} />;
    case 'industry':
      return <Briefcase className={cls} />;
    case 'employees':
      return <Users className={cls} />;
    case 'solution':
      return <Wrench className={cls} />;
    case 'product':
      return <Package className={cls} />;
    case 'budget':
      return <Wallet className={cls} />;
    case 'timeline':
      return <CalendarClock className={cls} />;
    case 'decision-maker':
      return <UserCog className={cls} />;
    default:
      return <Building2 className={cls} />;
  }
}

export default function ExtractedInformation({ fields }: ExtractedInformationProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Extracted Business Information</h3>
        <p className="text-slate-400 text-xs mt-1">Firmographics captured automatically from the call.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {fields.map((field) => (
          <div key={field.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              {renderIcon(field.icon)}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{field.label}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{field.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
