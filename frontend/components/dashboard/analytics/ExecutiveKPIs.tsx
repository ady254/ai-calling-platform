import React from 'react';
import { TrendingUp, CalendarCheck, UserCheck, Percent, Wallet, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ExecutiveKPI, ExecKPIIcon } from '@/types/analytics';

interface ExecutiveKPIsProps {
  cards: ExecutiveKPI[];
}

function renderIcon(icon: ExecKPIIcon, isHero: boolean) {
  const cls = isHero ? 'w-5 h-5 text-white' : 'w-5 h-5 text-indigo-500';
  switch (icon) {
    case 'pipeline':
      return <TrendingUp className={cls} />;
    case 'meetings':
      return <CalendarCheck className={cls} />;
    case 'leads':
      return <UserCheck className={cls} />;
    case 'conversion':
      return <Percent className={cls} />;
    case 'cost':
      return <Wallet className={cls} />;
    case 'roi':
      return <Sparkles className={cls} />;
    default:
      return <TrendingUp className={cls} />;
  }
}

function ChangeChip({ card }: { card: ExecutiveKPI }) {
  if (!card.change || !card.trend || card.trend === 'flat') return null;
  const good = card.trend === 'up' ? card.positiveWhenUp !== false : card.positiveWhenUp === false;
  const Arrow = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
        good ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
      }`}
    >
      <Arrow className="w-3 h-3" />
      {card.change}
    </span>
  );
}

export default function ExecutiveKPIs({ cards }: ExecutiveKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => {
        if (card.isHero) {
          return (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_24px_60px_-24px_rgba(99,102,241,0.65)] ring-1 ring-white/15 flex flex-col justify-between min-h-[168px]"
            >
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-white/80 font-medium text-sm tracking-wide">{card.label}</span>
                  <span className="text-4xl font-bold mt-1 tracking-tight">{card.value}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  {renderIcon(card.icon, true)}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
                {card.change && card.trend && card.trend !== 'flat' && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {card.change}
                  </span>
                )}
                {card.heroSubtitle && <span className="text-xs text-white/70 font-medium truncate">{card.heroSubtitle}</span>}
              </div>
            </div>
          );
        }

        return (
          <div
            key={card.id}
            className="rounded-2xl bg-white/95 p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] hover:shadow-[0_18px_45px_-20px_rgba(15,23,42,0.28)] transition-all duration-300 flex flex-col justify-between min-h-[168px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium text-sm tracking-wide">{card.label}</span>
                <span className="text-3xl font-semibold text-slate-800 mt-1 tracking-tight">{card.value}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                {renderIcon(card.icon, false)}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-50">
              <ChangeChip card={card} />
              <span className="text-xs text-slate-400 font-medium">vs previous period</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
