import React from 'react';
import {
  Gauge,
  TrendingUp,
  Smile,
  UserCheck,
  CalendarCheck,
  ArrowRightCircle,
} from 'lucide-react';
import { CallKPI, CallKPIIcon, Tone } from '@/types/call-details';

interface CallKPIsProps {
  cards: CallKPI[];
}

const TONE_STYLE: Record<Tone, { icon: string; iconBg: string; value: string }> = {
  positive: { icon: 'text-emerald-500', iconBg: 'bg-emerald-50 border-emerald-100/60', value: 'text-slate-800' },
  attention: { icon: 'text-amber-500', iconBg: 'bg-amber-50 border-amber-100/60', value: 'text-slate-800' },
  negative: { icon: 'text-rose-500', iconBg: 'bg-rose-50 border-rose-100/60', value: 'text-slate-800' },
  accent: { icon: 'text-indigo-500', iconBg: 'bg-indigo-50 border-indigo-100/60', value: 'text-slate-800' },
  neutral: { icon: 'text-slate-500', iconBg: 'bg-slate-100 border-slate-200/60', value: 'text-slate-800' },
};

function renderIcon(icon: CallKPIIcon, cls: string) {
  switch (icon) {
    case 'lead-score':
      return <Gauge className={cls} />;
    case 'buying-intent':
      return <TrendingUp className={cls} />;
    case 'sentiment':
      return <Smile className={cls} />;
    case 'decision-maker':
      return <UserCheck className={cls} />;
    case 'appointment':
      return <CalendarCheck className={cls} />;
    case 'next-action':
      return <ArrowRightCircle className={cls} />;
    default:
      return <Gauge className={cls} />;
  }
}

export default function CallKPIs({ cards }: CallKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => {
        const tone = TONE_STYLE[card.tone ?? 'neutral'];
        return (
          <div
            key={card.id}
            className="rounded-2xl bg-white/95 p-4 border border-slate-200/70 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.24)] hover:shadow-[0_14px_36px_-20px_rgba(15,23,42,0.3)] transition-all duration-300 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.label}</span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${tone.iconBg}`}>
                {renderIcon(card.icon, `w-4 h-4 ${tone.icon}`)}
              </div>
            </div>
            <div>
              <div className={`text-lg font-bold tracking-tight leading-tight ${tone.value}`}>{card.value}</div>
              {card.hint && <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{card.hint}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
