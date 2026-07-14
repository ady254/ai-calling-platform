"use client";

import React, { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'Show hospital leads',
  'Lead score above 80',
  'Not called this week',
  'Booked appointments',
];

export default function SearchBar({ value, onChange, suggestions = DEFAULT_SUGGESTIONS }: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition-all ${
          focused ? 'border-indigo-300 ring-2 ring-indigo-500/15' : 'border-slate-200/70 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.24)]'
        }`}
      >
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Ask anything — e.g. “Show hospital leads with score above 80”"
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none font-medium"
        />
        {value ? (
          <button onClick={() => onChange('')} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Clear">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-slate-300 shrink-0" />
        )}
      </div>

      {/* Suggestions */}
      {focused && !value && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-100 bg-white shadow-xl p-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1.5">
            Try natural language
          </div>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => onChange(s)}
              className="w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
