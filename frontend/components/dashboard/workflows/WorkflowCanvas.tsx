"use client";

import React from 'react';
import { Play, Loader2, Check, Trash2, ArrowDown, Plus, Workflow as WorkflowIcon, Sparkles } from 'lucide-react';
import { CanvasNode, NodeTestResult } from '@/types/workflow-studio';
import { NodeIcon, CATEGORY_STYLE } from './icons';

interface WorkflowCanvasProps {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  testResults: Record<string, NodeTestResult>;
  testing: boolean;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onRunTest: () => void;
  onOpenAssistant?: () => void;
}

const GRID_BG: React.CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)',
  backgroundSize: '18px 18px',
};

function TestBadge({ result }: { result?: NodeTestResult }) {
  if (!result || result.status === 'idle') return null;
  if (result.status === 'running' || result.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/70 px-1.5 py-0.5 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" />
        Running
      </span>
    );
  }
  if (result.status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100/70 px-1.5 py-0.5 rounded-full tabular-nums">
        <Check className="w-3 h-3" />
        {result.durationMs ? `${result.durationMs}ms` : 'OK'}
      </span>
    );
  }
  return null;
}

export default function WorkflowCanvas({
  nodes,
  selectedNodeId,
  testResults,
  testing,
  onSelectNode,
  onDeleteNode,
  onRunTest,
  onOpenAssistant,
}: WorkflowCanvasProps) {
  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <WorkflowIcon className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-700 truncate">Workflow Canvas</span>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 tabular-nums shrink-0">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/70 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          )}
          <button
            onClick={onRunTest}
            disabled={testing || nodes.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run Test
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8" style={GRID_BG}>
        {nodes.length === 0 ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <Plus className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Start building your AI employee</p>
            <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs">
              Add a trigger from the left, or describe the workflow with the AI Assistant.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {nodes.map((node, i) => {
              const style = CATEGORY_STYLE[node.category];
              const selected = selectedNodeId === node.id;
              const result = testResults[node.id];
              return (
                <React.Fragment key={node.id}>
                  <div
                    onClick={() => onSelectNode(node.id)}
                    className={`group relative w-full max-w-sm rounded-2xl border bg-white px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                      selected
                        ? 'border-transparent ring-2 ring-indigo-400/60 shadow-[0_16px_40px_-20px_rgba(99,102,241,0.5)]'
                        : 'border-slate-200/80 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.28)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}>
                        <NodeIcon icon={node.icon} className={`w-5 h-5 ${style.icon}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${style.chip}`}>
                            {style.label}
                          </span>
                          <TestBadge result={result} />
                        </div>
                        <div className="text-sm font-semibold text-slate-800 mt-1 truncate">{node.label}</div>
                        {node.subtitle && <div className="text-xs text-slate-400 font-medium truncate">{node.subtitle}</div>}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNode(node.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                        aria-label="Delete node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="flex flex-col items-center py-1.5">
                      <div className="w-px h-4 bg-slate-200" />
                      <ArrowDown className="w-4 h-4 text-slate-300 -my-0.5" />
                      <div className="w-px h-4 bg-slate-200" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
