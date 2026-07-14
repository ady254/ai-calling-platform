"use client";

import React, { useState } from 'react';
import { Settings2, TerminalSquare, ShieldCheck, Check, AlertTriangle, MousePointerClick } from 'lucide-react';
import { CanvasNode, NodeCategory, NodeTestResult } from '@/types/workflow-studio';
import { NodeIcon, CATEGORY_STYLE } from './icons';

interface InspectorPanelProps {
  selectedNode: CanvasNode | null;
  nodeCount: number;
  hasTrigger: boolean;
  testResults: Record<string, NodeTestResult>;
  onRename: (id: string, label: string) => void;
  onUpdateSubtitle: (id: string, subtitle: string) => void;
}

type Tab = 'config' | 'runtime' | 'validation';

const CATEGORY_FIELDS: Record<NodeCategory, { label: string; value: string }[]> = {
  trigger: [{ label: 'Source', value: 'Hospital campaign' }, { label: 'Filter', value: 'All contacts' }],
  'ai-logic': [{ label: 'Condition', value: 'is greater than' }, { label: 'Threshold', value: '75' }],
  action: [{ label: 'Template', value: 'Default' }, { label: 'Recipient', value: 'Contact' }],
  utility: [{ label: 'Duration', value: '1 day' }, { label: 'Mode', value: 'Business hours' }],
};

const inputCls =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition';

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function ValidationRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-emerald-50 border border-emerald-100/70' : 'bg-amber-50 border border-amber-100/70'}`}>
        {ok ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
      </span>
      <span className="text-sm text-slate-600 font-medium leading-tight">{text}</span>
    </div>
  );
}

export default function InspectorPanel({
  selectedNode,
  nodeCount,
  hasTrigger,
  testResults,
  onRename,
  onUpdateSubtitle,
}: InspectorPanelProps) {
  const [tab, setTab] = useState<Tab>('config');
  const result = selectedNode ? testResults[selectedNode.id] : undefined;

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col h-full">
      <div className="px-4 pt-4">
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight px-1 pb-3">Workflow Inspector</h3>
        <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/20">
          <TabButton active={tab === 'config'} icon={<Settings2 className="w-3.5 h-3.5" />} label="Config" onClick={() => setTab('config')} />
          <TabButton active={tab === 'runtime'} icon={<TerminalSquare className="w-3.5 h-3.5" />} label="Runtime" onClick={() => setTab('runtime')} />
          <TabButton active={tab === 'validation'} icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Checks" onClick={() => setTab('validation')} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {!selectedNode && tab === 'config' ? (
          <div className="flex flex-col items-center justify-center text-center py-14">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <MousePointerClick className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Select a node</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Click any node on the canvas to configure it.</p>
          </div>
        ) : tab === 'config' && selectedNode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${CATEGORY_STYLE[selectedNode.category].bg}`}>
                <NodeIcon icon={selectedNode.icon} className={`w-5 h-5 ${CATEGORY_STYLE[selectedNode.category].icon}`} />
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${CATEGORY_STYLE[selectedNode.category].chip}`}>
                {CATEGORY_STYLE[selectedNode.category].label}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Node Name</label>
              <input className={inputCls} value={selectedNode.label} onChange={(e) => onRename(selectedNode.id, e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Summary</label>
              <input
                className={inputCls}
                value={selectedNode.subtitle ?? ''}
                placeholder="Short description"
                onChange={(e) => onUpdateSubtitle(selectedNode.id, e.target.value)}
              />
            </div>

            <div className="pt-1 space-y-3">
              {CATEGORY_FIELDS[selectedNode.category].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{f.label}</label>
                  <input className={inputCls} defaultValue={f.value} />
                </div>
              ))}
            </div>
          </div>
        ) : tab === 'runtime' ? (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Input</div>
              <pre className="text-xs text-slate-600 font-mono bg-slate-50 border border-slate-100 rounded-xl p-3 overflow-x-auto">
{`{
  "contact": "John Smith",
  "campaign": "Hospital",
  "trigger": "${selectedNode?.label ?? 'Appointment Booked'}"
}`}
              </pre>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Output</div>
              <pre className="text-xs text-slate-600 font-mono bg-slate-50 border border-slate-100 rounded-xl p-3 overflow-x-auto">
{result?.output
  ? result.output
  : `{
  "status": "ok",
  "delivered": true
}`}
              </pre>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Execution History</div>
              <div className="space-y-1.5">
                {['Delivered · 1.4s · 2m ago', 'Delivered · 1.6s · 1h ago', 'Delivered · 1.5s · 3h ago'].map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <ValidationRow ok={hasTrigger} text={hasTrigger ? 'Starts with a trigger node' : 'Add a trigger to start the workflow'} />
            <ValidationRow ok={nodeCount >= 2} text={nodeCount >= 2 ? 'Has at least one action' : 'Add an action after the trigger'} />
            <ValidationRow ok text="All nodes are connected" />
            <ValidationRow ok text="No unreachable steps" />
          </div>
        )}
      </div>
    </div>
  );
}
