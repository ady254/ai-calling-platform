import React from 'react';
import { ArrowRight } from 'lucide-react';
import { WorkflowTemplate } from '@/types/workflow-studio';
import { NodeIcon } from './icons';

interface TemplateGalleryProps {
  templates: WorkflowTemplate[];
  onUse: (template: WorkflowTemplate) => void;
}

export default function TemplateGallery({ templates, onUse }: TemplateGalleryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Start from a template</h3>
          <p className="text-slate-400 text-xs mt-0.5">Production-ready flows you can customize in seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className="group rounded-2xl bg-white/95 p-5 border border-slate-200/70 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.22)] hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/40 border border-indigo-100/60 flex items-center justify-center shrink-0">
                <NodeIcon icon={t.icon} className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-800">{t.name}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{t.description}</p>
              </div>
            </div>

            <button
              onClick={() => onUse(t)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 text-sm font-semibold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/70 rounded-xl transition-colors"
            >
              Use Template
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
