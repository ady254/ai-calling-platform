import React from 'react';
import { FileText } from 'lucide-react';
import { ExecutiveReportData } from '@/types/call-details';

interface ExecutiveReportProps {
  report: ExecutiveReportData;
}

export default function ExecutiveReport({ report }: ExecutiveReportProps) {
  // Emphasise numbers, percentages and currency in the narrative.
  const formatBody = (text: string) => {
    const regex = /(\$\d[\d,]*(?:\.\d+)?|\d+(?:,\d+)*(?:\.\d+)?%?)/g;
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <strong key={index} className="text-slate-800 font-bold bg-indigo-50/60 px-1 rounded">
          {part}
        </strong>
      ) : (
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  return (
    <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)] relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6366f1] to-[#8b5cf6]" />
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">{report.title}</h3>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium max-w-5xl">
            {formatBody(report.body)}
          </p>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{report.footer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
