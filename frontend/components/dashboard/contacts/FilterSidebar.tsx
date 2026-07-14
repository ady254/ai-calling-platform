"use client";

import React, { useState } from 'react';
import { ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { ContactFilterConfig, ContactFilters, FilterOption } from '@/types/contacts-crm';

type MultiGroup = 'statuses' | 'scoreRanges' | 'industries' | 'tags';

interface FilterSidebarProps {
  config: ContactFilterConfig;
  filters: ContactFilters;
  onToggleMulti: (group: MultiGroup, id: string) => void;
  onSetLastContacted: (id: string | null) => void;
  onClearAll: () => void;
}

function activeCount(filters: ContactFilters) {
  return (
    filters.statuses.length +
    filters.scoreRanges.length +
    filters.industries.length +
    filters.tags.length +
    (filters.lastContacted ? 1 : 0)
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 group"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="pb-3.5 space-y-0.5">{children}</div>}
    </div>
  );
}

function CheckRow({
  option,
  checked,
  onClick,
  radio = false,
}: {
  option: FilterOption;
  checked: boolean;
  onClick: () => void;
  radio?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
    >
      <span
        className={`w-4 h-4 flex items-center justify-center border transition-all shrink-0 ${
          radio ? 'rounded-full' : 'rounded-[5px]'
        } ${checked ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'}`}
      >
        {checked && <Check className="w-3 h-3" />}
      </span>
      <span className={`text-sm font-medium ${checked ? 'text-slate-800' : 'text-slate-600'}`}>{option.label}</span>
    </button>
  );
}

export default function FilterSidebar({
  config,
  filters,
  onToggleMulti,
  onSetLastContacted,
  onClearAll,
}: FilterSidebarProps) {
  const count = activeCount(filters);

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] p-5">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Filters</h3>
          {count > 0 && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/70 rounded-full px-1.5 py-0.5 tabular-nums">
              {count}
            </span>
          )}
        </div>
        {count > 0 && (
          <button onClick={onClearAll} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
            Clear
          </button>
        )}
      </div>

      <FilterSection title="Status">
        {config.statuses.map((opt) => (
          <CheckRow
            key={opt.id}
            option={opt}
            checked={filters.statuses.includes(opt.id)}
            onClick={() => onToggleMulti('statuses', opt.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Lead Score">
        {config.scoreRanges.map((opt) => (
          <CheckRow
            key={opt.id}
            option={opt}
            checked={filters.scoreRanges.includes(opt.id)}
            onClick={() => onToggleMulti('scoreRanges', opt.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Industry">
        {config.industries.map((opt) => (
          <CheckRow
            key={opt.id}
            option={opt}
            checked={filters.industries.includes(opt.id)}
            onClick={() => onToggleMulti('industries', opt.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Tags">
        {config.tags.map((opt) => (
          <CheckRow
            key={opt.id}
            option={opt}
            checked={filters.tags.includes(opt.id)}
            onClick={() => onToggleMulti('tags', opt.id)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Last Contacted">
        {config.lastContacted.map((opt) => (
          <CheckRow
            key={opt.id}
            option={opt}
            radio
            checked={filters.lastContacted === opt.id}
            onClick={() => onSetLastContacted(filters.lastContacted === opt.id ? null : opt.id)}
          />
        ))}
      </FilterSection>
    </div>
  );
}
