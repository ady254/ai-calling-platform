"use client";

import React, { useMemo, useState } from 'react';
import { Search, Play, MessageSquare, Loader2 } from 'lucide-react';
import { TranscriptSegment, TranscriptTag } from '@/types/call-details';

interface TranscriptViewerProps {
  segments: TranscriptSegment[] | null; // null => processing
  currentTime: number;
  onSeek?: (seconds: number) => void;
}

type FilterKey = 'all' | TranscriptTag;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'question', label: 'Questions' },
  { key: 'objection', label: 'Objections' },
  { key: 'pricing', label: 'Pricing' },
];

const TAG_STYLE: Record<TranscriptTag, string> = {
  question: 'bg-blue-50 text-blue-600 border-blue-100/70',
  objection: 'bg-amber-50 text-amber-600 border-amber-100/70',
  pricing: 'bg-violet-50 text-violet-600 border-violet-100/70',
};

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-indigo-100 text-indigo-700 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function TranscriptViewer({ segments, currentTime, onSeek }: TranscriptViewerProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const activeIndex = useMemo(() => {
    if (!segments) return -1;
    let idx = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].timestamp <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [segments, currentTime]);

  const visible = useMemo(() => {
    if (!segments) return [];
    return segments.filter((s) => {
      const matchesFilter = filter === 'all' || (s.tags ?? []).includes(filter);
      const matchesQuery = !query.trim() || s.text.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [segments, filter, query]);

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] overflow-hidden">
      {/* Header + controls */}
      <div className="p-6 pb-4 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Transcript</h3>
            <p className="text-slate-400 text-xs mt-1">Click any timestamp to jump to that moment.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transcript"
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
              />
            </div>
            <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/20 shrink-0">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                    filter === f.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 max-h-[560px] overflow-y-auto">
        {!segments ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">Transcript processing…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No messages match your search.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {visible.map((seg) => {
              const isAI = seg.speaker === 'ai';
              const isActive = segments[activeIndex]?.id === seg.id;
              return (
                <div key={seg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] ${isAI ? '' : 'items-end'} flex flex-col gap-1.5`}>
                    <div className={`flex items-center gap-2 ${isAI ? '' : 'flex-row-reverse'}`}>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider ${
                          isAI ? 'text-indigo-500' : 'text-slate-500'
                        }`}
                      >
                        {isAI ? 'AI Agent' : 'Customer'}
                      </span>
                      <button
                        onClick={() => onSeek?.(seg.timestamp)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors tabular-nums"
                        title="Jump to this moment"
                      >
                        <Play className="w-2.5 h-2.5" />
                        {fmt(seg.timestamp)}
                      </button>
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed border transition-all duration-300 ${
                        isAI
                          ? 'bg-indigo-50/60 border-indigo-100/70 text-slate-700 rounded-tl-sm'
                          : 'bg-white border-slate-200/80 text-slate-700 rounded-tr-sm'
                      } ${isActive ? 'ring-2 ring-indigo-400/50 border-transparent shadow-sm' : ''}`}
                    >
                      {highlight(seg.text, query)}
                      {seg.tags && seg.tags.length > 0 && (
                        <div className={`flex flex-wrap gap-1.5 mt-2 ${isAI ? '' : 'justify-end'}`}>
                          {seg.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border capitalize ${TAG_STYLE[tag]}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
