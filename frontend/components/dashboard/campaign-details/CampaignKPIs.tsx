import React from 'react';
import {
  PhoneCall,
  Loader2,
  UserCheck,
  CalendarCheck,
  TrendingUp,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import { CampaignKPI, CampaignKPIIcon } from '@/types/campaign-details';

interface CampaignKPIsProps {
  cards: CampaignKPI[];
}

function renderIcon(icon: CampaignKPIIcon, isHero: boolean) {
  const cls = isHero ? 'w-5 h-5 text-white' : 'w-5 h-5 text-indigo-500';
  switch (icon) {
    case 'calls-completed':
      return <PhoneCall className={cls} />;
    case 'in-progress':
      return <Loader2 className={`${cls} ${isHero ? '' : 'animate-spin'}`} />;
    case 'qualified':
      return <UserCheck className={cls} />;
    case 'appointments':
      return <CalendarCheck className={cls} />;
    case 'conversion':
      return <TrendingUp className={cls} />;
    case 'pipeline':
      return <Wallet className={cls} />;
    default:
      return <PhoneCall className={cls} />;
  }
}

export default function CampaignKPIs({ cards }: CampaignKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
      {cards.map((card) => {
        if (card.isHero) {
          return (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_24px_60px_-24px_rgba(99,102,241,0.65)] ring-1 ring-white/15 hover:shadow-[0_30px_70px_-24px_rgba(99,102,241,0.75)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[168px] sm:col-span-2 lg:col-span-1"
            >
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-white/80 font-medium text-sm tracking-wide">{card.title}</span>
                  <span className="text-4xl font-bold mt-1 tracking-tight">{card.value}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  {renderIcon(card.icon, true)}
                </div>
              </div>
              {card.subLabel && (
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
                  <span className="text-xs text-white/75 font-medium truncate">{card.subLabel}</span>
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={card.id}
            className="rounded-2xl bg-white/95 p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] hover:shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[168px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium text-sm tracking-wide">{card.title}</span>
                <span className="text-3xl font-semibold text-slate-800 mt-1 tracking-tight font-sans">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                {renderIcon(card.icon, false)}
              </div>
            </div>

            {card.subLabel && (
              <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-50">
                {card.changeType === 'positive' ? (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {card.subLabel}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">{card.subLabel}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
