import React from 'react';
import { Plus, LayoutTemplate, Upload } from 'lucide-react';

interface WorkflowHeaderProps {
  title?: string;
  subtitle?: string;
  onNew?: () => void;
  onTemplates?: () => void;
  onImport?: () => void;
}

export default function WorkflowHeader({
  title = 'AI Workflow Studio',
  subtitle = 'Automate everything your AI employee should do before, during and after every conversation.',
  onNew,
  onTemplates,
  onImport,
}: WorkflowHeaderProps) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-semibold text-slate-800 tracking-tight font-sans">{title}</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={onTemplates}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <LayoutTemplate className="w-4 h-4" />
          Templates
        </button>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>
    </header>
  );
}
