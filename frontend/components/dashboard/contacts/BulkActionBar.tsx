"use client";

import React from 'react';
import { Megaphone, Bot, Download, Tag, CalendarClock, Trash2, X } from 'lucide-react';

export type BulkAction = 'campaign' | 'agent' | 'export' | 'tags' | 'schedule' | 'delete';

interface BulkActionBarProps {
  count: number;
  onAction: (action: BulkAction) => void;
  onClear: () => void;
}

const ACTIONS: { key: BulkAction; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  { key: 'campaign', label: 'Assign Campaign', icon: <Megaphone className="w-4 h-4" /> },
  { key: 'agent', label: 'Assign AI Agent', icon: <Bot className="w-4 h-4" /> },
  { key: 'schedule', label: 'Schedule Calls', icon: <CalendarClock className="w-4 h-4" /> },
  { key: 'tags', label: 'Add Tags', icon: <Tag className="w-4 h-4" /> },
  { key: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> },
  { key: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, danger: true },
];

export default function BulkActionBar({ count, onAction, onClear }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-slate-900 text-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.6)] border border-white/10 px-3 py-2.5 max-w-[calc(100vw-2rem)] overflow-x-auto">
        <div className="flex items-center gap-2 pr-2 mr-1 border-r border-white/10 shrink-0">
          <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-white/15 text-xs font-bold tabular-nums">
            {count}
          </span>
          <span className="text-sm font-medium text-white/80 whitespace-nowrap">selected</span>
        </div>

        {ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => onAction(a.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors shrink-0 ${
              a.danger ? 'text-rose-300 hover:bg-rose-500/15' : 'text-white/90 hover:bg-white/10'
            }`}
          >
            {a.icon}
            <span className="hidden sm:inline">{a.label}</span>
          </button>
        ))}

        <button
          onClick={onClear}
          className="ml-1 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
