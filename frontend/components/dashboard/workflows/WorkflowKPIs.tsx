import React from 'react';
import { Workflow, Activity, CheckCircle2, AlertTriangle, Clock, Send } from 'lucide-react';
import { WorkflowKPI, WFKPIIcon } from '@/types/workflow-studio';

interface WorkflowKPIsProps {
  cards: WorkflowKPI[];
}

function renderIcon(icon: WFKPIIcon) {
  const cls = 'w-4 h-4 text-indigo-500';
  switch (icon) {
    case 'active':
      return <Workflow className={cls} />;
    case 'executions':
      return <Activity className={cls} />;
    case 'success':
      return <CheckCircle2 className={cls} />;
    case 'failed':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'time':
      return <Clock className={cls} />;
    case 'followups':
      return <Send className={cls} />;
    default:
      return <Activity className={cls} />;
  }
}

export default function WorkflowKPIs({ cards }: WorkflowKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-2xl bg-white/95 p-5 border border-slate-200/70 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.24)] hover:shadow-[0_14px_36px_-20px_rgba(15,23,42,0.3)] transition-all duration-300 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{card.label}</span>
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.icon === 'failed' ? 'bg-amber-50 border-amber-100/60' : 'bg-indigo-50 border-indigo-100/50'}`}>
              {renderIcon(card.icon)}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-slate-800 tracking-tight tabular-nums">{card.value}</div>
            {card.hint && <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{card.hint}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
