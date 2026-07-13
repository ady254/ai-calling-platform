"use client";

import React, { useState } from 'react';
import { GitCompare, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { PromptComparisonData } from '@/types/call-details';

interface PromptComparisonProps {
  data: PromptComparisonData;
  onCopySuggested?: () => void;
}

export default function PromptComparison({ data, onCopySuggested }: PromptComparisonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.suggested.content);
      setCopied(true);
      onCopySuggested?.();
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="bg-white/95 rounded-2xl p-6 sm:p-7 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <GitCompare className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Prompt Version Comparison</h3>
          <p className="text-slate-400 text-xs">Current system prompt vs the AI-suggested rewrite.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current — v1 */}
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white border border-slate-200 rounded-md px-2 py-0.5">
              {data.current.version}
            </span>
            <span className="text-sm font-semibold text-slate-500">{data.current.label}</span>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed whitespace-pre-wrap flex-1">
            {data.current.content}
          </p>
        </div>

        {/* Suggested — v2 */}
        <div className="rounded-xl border-2 border-indigo-200/70 bg-indigo-50/30 p-5 flex flex-col relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-[#8b5cf6] rounded-md px-2 py-0.5">
                {data.suggested.version}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700">
                <Sparkles className="w-3.5 h-3.5" />
                {data.suggested.label}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap flex-1">
            {data.suggested.content}
          </p>
        </div>
      </div>

      {/* What changed */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/40 p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">What changed</span>
        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {data.changes.map((change, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-medium">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
              {change}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
