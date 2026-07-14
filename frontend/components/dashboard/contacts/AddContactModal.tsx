"use client";

import React, { useEffect, useState } from 'react';
import { X, UserPlus, Pencil } from 'lucide-react';
import { CRMContact, FilterOption } from '@/types/contacts-crm';

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  company: string;
  industry: string;
  status: string;
  leadScore: number;
  tags: string; // comma-separated
}

interface AddContactModalProps {
  open: boolean;
  initial?: CRMContact | null;
  industries: FilterOption[];
  statuses: FilterOption[];
  onClose: () => void;
  onSave: (data: ContactFormData) => void;
}

const EMPTY: ContactFormData = {
  name: '',
  phone: '',
  email: '',
  company: '',
  industry: '',
  status: 'new',
  leadScore: 0,
  tags: '',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition';

export default function AddContactModal({
  open,
  initial,
  industries,
  statuses,
  onClose,
  onSave,
}: AddContactModalProps) {
  const [form, setForm] = useState<ContactFormData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initial;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name: initial.name,
        phone: initial.phone,
        email: initial.email,
        company: initial.company,
        industry: initial.industry,
        status: initial.status,
        leadScore: initial.leadScore,
        tags: initial.tags.join(', '),
      });
    } else {
      setForm({ ...EMPTY, industry: industries[0]?.id ?? '' });
    }
    setError(null);
  }, [open, initial, industries]);

  if (!open) return null;

  const set = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center">
              {isEdit ? <Pencil className="w-4 h-4 text-indigo-600" /> : <UserPlus className="w-4 h-4 text-indigo-600" />}
            </div>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
              {isEdit ? 'Edit Contact' : 'Add Contact'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input className={inputCls} placeholder="John Smith" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Phone Number *">
              <input className={inputCls} placeholder="+1 415 555 0142" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input className={inputCls} type="email" placeholder="john@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Company">
              <input className={inputCls} placeholder="ABC Hospital" value={form.company} onChange={(e) => set('company', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Industry">
              <select className={inputCls} value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                <option value="">Select industry</option>
                {industries.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                {statuses.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Lead Score (0–100)">
              <input
                className={inputCls}
                type="number"
                min={0}
                max={100}
                value={form.leadScore}
                onChange={(e) => set('leadScore', Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              />
            </Field>
            <Field label="Tags (comma separated)">
              <input className={inputCls} placeholder="VIP, Hot Lead" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            </Field>
          </div>

          {error && <p className="text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{error}</p>}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
          >
            {isEdit ? 'Save Changes' : 'Add Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}
