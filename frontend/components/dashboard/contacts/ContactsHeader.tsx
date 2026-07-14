import React from 'react';
import { Upload, Download, Plus } from 'lucide-react';

interface ContactsHeaderProps {
  title?: string;
  subtitle?: string;
  onImport?: () => void;
  onExport?: () => void;
  onAdd?: () => void;
}

export default function ContactsHeader({
  title = 'Contacts',
  subtitle = 'Manage leads, customers and AI calling lists.',
  onImport,
  onExport,
  onAdd,
}: ContactsHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl lg:text-4xl font-semibold text-slate-800 tracking-tight font-sans">{title}</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onImport}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>
    </header>
  );
}
