"use client";

import React from 'react';
import { Phone, CalendarPlus, Eye, Pencil, Trash2, Check, Minus } from 'lucide-react';
import { CRMContact } from '@/types/contacts-crm';
import { LeadScoreBadge, StatusBadge, relativeTime } from './badges';

export type QuickAction = 'call' | 'schedule' | 'view' | 'edit' | 'delete';

interface ContactsTableProps {
  contacts: CRMContact[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRowClick: (contact: CRMContact) => void;
  onQuickAction: (action: QuickAction, contact: CRMContact) => void;
}

const COLUMNS = [
  'Name',
  'Company',
  'Phone',
  'Industry',
  'Lead Score',
  'Status',
  'Last Contact',
  'Assigned AI Agent',
  'Next Action',
];

function CheckBox({
  checked,
  indeterminate = false,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-4 h-4 rounded-[5px] border flex items-center justify-center transition-all shrink-0 ${
        checked || indeterminate ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 hover:border-indigo-400'
      }`}
      aria-label="Select"
    >
      {indeterminate ? <Minus className="w-3 h-3" /> : checked ? <Check className="w-3 h-3" /> : null}
    </button>
  );
}

const ACTIONS: { key: QuickAction; label: string; icon: React.ReactNode; hover: string }[] = [
  { key: 'call', label: 'Call Now', icon: <Phone className="w-4 h-4" />, hover: 'hover:text-emerald-600 hover:bg-emerald-50' },
  { key: 'schedule', label: 'Schedule Call', icon: <CalendarPlus className="w-4 h-4" />, hover: 'hover:text-indigo-600 hover:bg-indigo-50' },
  { key: 'view', label: 'View Details', icon: <Eye className="w-4 h-4" />, hover: 'hover:text-slate-800 hover:bg-slate-100' },
  { key: 'edit', label: 'Edit', icon: <Pencil className="w-4 h-4" />, hover: 'hover:text-blue-600 hover:bg-blue-50' },
  { key: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, hover: 'hover:text-rose-600 hover:bg-rose-50' },
];

export default function ContactsTable({
  contacts,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onQuickAction,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="bg-white/95 rounded-2xl border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1180px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="w-12 px-4 py-3">
                <CheckBox checked={allSelected} indeterminate={someSelected} onClick={onToggleSelectAll} />
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c}
                  className="text-left font-semibold text-[11px] uppercase tracking-wider text-slate-400 px-4 py-3 whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
              <th className="text-right font-semibold text-[11px] uppercase tracking-wider text-slate-400 px-4 py-3 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {contacts.map((contact) => {
              const selected = selectedIds.includes(contact.id);
              return (
                <tr
                  key={contact.id}
                  onClick={() => onRowClick(contact)}
                  className={`group cursor-pointer transition-colors ${selected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}
                >
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <CheckBox checked={selected} onClick={() => onToggleSelect(contact.id)} />
                  </td>

                  {/* Name + email */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                        {contact.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-700 leading-tight">{contact.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[180px]">{contact.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">{contact.company}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 tabular-nums">{contact.phone}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-md px-2 py-0.5">
                      {contact.industry}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <LeadScoreBadge score={contact.leadScore} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                    {relativeTime(contact.lastContact)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`text-sm font-medium ${contact.assignedAgent === 'Unassigned' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {contact.assignedAgent}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-medium">{contact.nextAction}</td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {ACTIONS.map((a) => (
                        <button
                          key={a.key}
                          onClick={() => onQuickAction(a.key, contact)}
                          title={a.label}
                          className={`p-1.5 rounded-lg text-slate-400 transition-colors ${a.hover}`}
                        >
                          {a.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
