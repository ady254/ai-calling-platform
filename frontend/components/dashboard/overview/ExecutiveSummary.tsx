import React from 'react';
import { Sparkles } from 'lucide-react';

interface ExecutiveSummaryProps {
  summary: {
    title: string;
    body: string;
    footer: string;
  };
}

export default function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  // A helper function to highlight key metrics in the body text
  const formatBody = (text: string) => {
    // Regex to match numbers, percentages, and currencies
    const regex = /(\d+(?:,\d+)*(?:\.\d+)?%?|\$\d+(?:,\d+)*(?:\.\d+)?)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <strong key={index} className="text-slate-800 font-bold bg-indigo-50/50 px-1 rounded">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/70 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.18)] hover:shadow-[0_10px_28px_-18px_rgba(15,23,42,0.22)] transition-all duration-300 w-full relative overflow-hidden">
      {/* Premium accent bar on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6366f1] to-[#8b5cf6]" />
      
      <div className="flex items-start gap-4">
        {/* Sparkles Icon Wrapper */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">
              {summary.title}
            </h3>
          </div>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-sans max-w-5xl font-medium">
            {formatBody(summary.body)}
          </p>

          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider font-sans">
              {summary.footer}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
