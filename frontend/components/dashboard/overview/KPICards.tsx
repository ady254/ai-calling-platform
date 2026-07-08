import React from 'react';
import { 
  Phone, 
  CalendarCheck, 
  Users, 
  TrendingUp, 
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { KPICardData } from '@/types/overview';

interface KPICardsProps {
  cards: KPICardData[];
}

export default function KPICards({ cards }: KPICardsProps) {
  // Map string icon names to Lucide elements
  const renderIcon = (iconName: string, isHero?: boolean) => {
    const iconClass = isHero 
      ? 'w-5 h-5 text-white' 
      : 'w-5 h-5 text-indigo-500';
    
    switch (iconName) {
      case 'phone':
        return <Phone className={iconClass} />;
      case 'calendar-check':
        return <CalendarCheck className={iconClass} />;
      case 'users':
        return <Users className={iconClass} />;
      case 'trending-up':
        return <TrendingUp className={iconClass} />;
      case 'wallet':
        return <Wallet className={iconClass} />;
      default:
        return <Phone className={iconClass} />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => {
        if (card.isHero) {
          // Special styling for the Purple Hero Card (Estimated Pipeline)
          return (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
            >
              {/* Subtle background glow */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-white/80 font-medium text-sm tracking-wide">
                    {card.title}
                  </span>
                  <span className="text-4xl font-bold mt-1 tracking-tight">
                    {card.value}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  {renderIcon(card.iconName, true)}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/10">
                {card.change && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {card.change}
                  </span>
                )}
                {card.infoText && (
                  <span className="text-xs text-white/70 font-medium truncate">
                    {card.infoText}
                  </span>
                )}
              </div>
            </div>
          );
        }

        // Standard Card Styling
        return (
          <div
            key={card.id}
            className="rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-slate-400 font-medium text-sm tracking-wide">
                  {card.title}
                </span>
                <span className="text-3xl font-semibold text-slate-800 mt-1 tracking-tight font-sans">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                {renderIcon(card.iconName, false)}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-50">
              {card.change && (
                <span className={`text-xs font-medium ${
                  card.changeType === 'positive' 
                    ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-semibold' 
                    : 'text-slate-500'
                }`}>
                  {card.changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                  {card.change}
                </span>
              )}
              {card.infoText && (
                <span className="text-xs text-slate-400 font-medium">
                  {card.infoText}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
