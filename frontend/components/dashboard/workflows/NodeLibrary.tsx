"use client";

import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { NodeDef, NodeLibrarySection } from '@/types/workflow-studio';
import { NodeIcon, CATEGORY_STYLE } from './icons';

interface NodeLibraryProps {
  sections: NodeLibrarySection[];
  onAddNode: (def: NodeDef) => void;
}

function Section({ section, onAddNode }: { section: NodeLibrarySection; onAddNode: (d: NodeDef) => void }) {
  const [open, setOpen] = useState(true);
  const style = CATEGORY_STYLE[section.category];

  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between py-3">
        <span className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{section.title}</span>
          <span className="text-[10px] font-semibold text-slate-400 tabular-nums">{section.nodes.length}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="pb-3 space-y-1.5">
          {section.nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => onAddNode(node)}
              className="group w-full flex items-center gap-2.5 p-2 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 transition-all text-left"
            >
              <span className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${style.bg}`}>
                <NodeIcon icon={node.icon} className={`w-3.5 h-3.5 ${style.icon}`} />
              </span>
              <span className="text-sm font-medium text-slate-700 flex-1 truncate">{node.label}</span>
              <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NodeLibrary({ sections, onAddNode }: NodeLibraryProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.toLowerCase();
    return sections
      .map((s) => ({ ...s, nodes: s.nodes.filter((n) => n.label.toLowerCase().includes(q)) }))
      .filter((s) => s.nodes.length > 0);
  }, [sections, query]);

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-800 tracking-tight px-1 pb-3">Available Nodes</h3>
      <div className="relative mb-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes"
          className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/60 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
        />
      </div>
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium text-center py-8">No nodes match.</p>
        ) : (
          filtered.map((section) => <Section key={section.category} section={section} onAddNode={onAddNode} />)
        )}
      </div>
    </div>
  );
}
