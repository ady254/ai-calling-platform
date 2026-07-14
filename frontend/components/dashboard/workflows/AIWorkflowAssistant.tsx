"use client";

import React, { useState } from 'react';
import { Sparkles, X, Wand2, Loader2, CornerDownLeft } from 'lucide-react';

interface AIWorkflowAssistantProps {
  open: boolean;
  generating?: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const EXAMPLE =
  'When a hospital confirms an appointment, send a WhatsApp confirmation, notify the receptionist and schedule a follow-up one day before.';

const SUGGESTIONS = [
  'Qualify inbound leads and route hot ones to sales.',
  'Recover missed calls with an instant WhatsApp + follow-up.',
  'After a positive call, generate a proposal and create a task.',
];

export default function AIWorkflowAssistant({ open, generating, onClose, onGenerate }: AIWorkflowAssistantProps) {
  const [prompt, setPrompt] = useState(EXAMPLE);

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] p-4 pointer-events-none">
      <div className="pointer-events-auto h-full flex flex-col rounded-2xl bg-white border border-slate-200/70 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden p-5 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">AI Workflow Assistant</h3>
                <p className="text-white/75 text-xs font-medium">Describe it — the AI builds it.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 -mr-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Describe your workflow</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="e.g. When a lead is qualified, send an email and book a calendar slot…"
              className="mt-1.5 w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition resize-none leading-relaxed"
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Try one of these</div>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => onGenerate(prompt)}
            disabled={generating || !prompt.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generating ? 'Generating…' : 'Generate Workflow'}
          </button>
          <p className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium mt-2">
            <CornerDownLeft className="w-3 h-3" />
            Builds nodes on the canvas automatically
          </p>
        </div>
      </div>
    </div>
  );
}
