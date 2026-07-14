import React from 'react';
import { Plus, MessagesSquare, Bot, Download, FileText, ChevronRight } from 'lucide-react';

export type QuickActionKey = 'create-campaign' | 'view-conversations' | 'optimize-agent' | 'export' | 'pdf';

interface QuickActionsProps {
  onAction: (key: QuickActionKey) => void;
}

const ACTIONS: { key: QuickActionKey; label: string; icon: React.ReactNode }[] = [
  { key: 'create-campaign', label: 'Create Campaign', icon: <Plus className="w-4 h-4" /> },
  { key: 'view-conversations', label: 'View Conversations', icon: <MessagesSquare className="w-4 h-4" /> },
  { key: 'optimize-agent', label: 'Optimize AI Agent', icon: <Bot className="w-4 h-4" /> },
  { key: 'export', label: 'Export Analytics', icon: <Download className="w-4 h-4" /> },
  { key: 'pdf', label: 'Generate Executive PDF', icon: <FileText className="w-4 h-4" /> },
];

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)]">
      <h3 className="text-base font-semibold text-slate-800 tracking-tight mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => onAction(a.key)}
            className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300 p-4 transition-all text-left active:scale-[0.98]"
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 shrink-0">
                {a.icon}
              </span>
              <span className="text-sm font-semibold text-slate-700 truncate">{a.label}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
