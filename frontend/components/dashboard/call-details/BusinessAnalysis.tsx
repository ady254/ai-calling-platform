import React from 'react';
import {
  Target,
  AlertTriangle,
  ShieldQuestion,
  ThumbsUp,
  ThumbsDown,
  Check,
} from 'lucide-react';
import { BusinessAnalysisItem, AnalysisIcon, Tone } from '@/types/call-details';

interface BusinessAnalysisProps {
  items: BusinessAnalysisItem[];
}

const TONE_STYLE: Record<Tone, { icon: string; iconBg: string; dot: string }> = {
  accent: { icon: 'text-indigo-500', iconBg: 'bg-indigo-50 border-indigo-100/60', dot: 'bg-indigo-400' },
  positive: { icon: 'text-emerald-500', iconBg: 'bg-emerald-50 border-emerald-100/60', dot: 'bg-emerald-400' },
  attention: { icon: 'text-amber-500', iconBg: 'bg-amber-50 border-amber-100/60', dot: 'bg-amber-400' },
  negative: { icon: 'text-rose-500', iconBg: 'bg-rose-50 border-rose-100/60', dot: 'bg-rose-400' },
  neutral: { icon: 'text-slate-500', iconBg: 'bg-slate-100 border-slate-200/60', dot: 'bg-slate-400' },
};

function renderIcon(icon: AnalysisIcon, cls: string) {
  switch (icon) {
    case 'intent':
      return <Target className={cls} />;
    case 'pain':
      return <AlertTriangle className={cls} />;
    case 'objection':
      return <ShieldQuestion className={cls} />;
    case 'positive':
      return <ThumbsUp className={cls} />;
    case 'negative':
      return <ThumbsDown className={cls} />;
    default:
      return <Target className={cls} />;
  }
}

export default function BusinessAnalysis({ items }: BusinessAnalysisProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">AI Business Analysis</h3>
        <p className="text-slate-400 text-xs mt-1">Structured read of the conversation&apos;s commercial signals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => {
          const tone = TONE_STYLE[item.tone];
          return (
            <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/40 p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${tone.iconBg}`}>
                  {renderIcon(item.icon, `w-5 h-5 ${tone.icon}`)}
                </div>
                <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
              </div>

              {item.text && <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.text}</p>}

              {item.items && (
                <ul className="space-y-2">
                  {item.items.map((li, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tone.iconBg} border`}>
                        <Check className={`w-2.5 h-2.5 ${tone.icon}`} />
                      </span>
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
