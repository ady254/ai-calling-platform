"use client";

import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  MessageSquareText,
  CalendarClock,
  Building2,
  Briefcase,
  Mail,
  Megaphone,
  Bot,
  StickyNote,
} from 'lucide-react';
import { CRMContact, CRMSentiment } from '@/types/contacts-crm';
import { LeadScoreBadge, StatusBadge } from './badges';
import AIRecommendations from './AIRecommendations';

interface ContactDrawerProps {
  contact: CRMContact | null;
  onClose: () => void;
  onStartCall?: (contact: CRMContact) => void;
  onOpenConversation?: (contact: CRMContact) => void;
  onScheduleFollowUp?: (contact: CRMContact) => void;
}

const SENTIMENT_STYLE: Record<CRMSentiment, { text: string; dot: string }> = {
  Positive: { text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Neutral: { text: 'text-slate-500', dot: 'bg-slate-400' },
  Negative: { text: 'text-rose-600', dot: 'bg-rose-500' },
};

function InfoRow({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="inline-flex items-center gap-2 text-sm text-slate-400 font-medium shrink-0">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700 text-right min-w-0 truncate">{children}</span>
    </div>
  );
}

export default function ContactDrawer({
  contact,
  onClose,
  onStartCall,
  onOpenConversation,
  onScheduleFollowUp,
}: ContactDrawerProps) {
  const [displayContact, setDisplayContact] = useState<CRMContact | null>(contact);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (contact) {
      setDisplayContact(contact);
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
  }, [contact]);

  useEffect(() => {
    document.body.style.overflow = displayContact ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [displayContact]);

  if (!displayContact) return null;
  const c = displayContact;
  const sentiment = SENTIMENT_STYLE[c.sentiment];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        onTransitionEnd={() => {
          if (!shown) setDisplayContact(null);
        }}
        className={`absolute right-0 top-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          shown ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/60 flex items-center justify-center text-base font-bold text-indigo-600 shrink-0">
              {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-800 tracking-tight truncate">{c.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={c.status} />
                <LeadScoreBadge score={c.leadScore} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 -mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => onStartCall?.(c)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              Start AI Call
            </button>
            <button
              onClick={() => onOpenConversation?.(c)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              <MessageSquareText className="w-4 h-4" />
              Conversation
            </button>
            <button
              onClick={() => onScheduleFollowUp?.(c)}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
            >
              <CalendarClock className="w-4 h-4" />
              Schedule
            </button>
          </div>

          {/* AI recommendations */}
          <AIRecommendations recommendations={c.aiRecommendations} conversionProbability={c.conversionProbability} />

          {/* Customer information */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Customer Information</h3>
            <div className="divide-y divide-slate-100">
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company">{c.company}</InfoRow>
              <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Industry">{c.industry}</InfoRow>
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone">{c.phone}</InfoRow>
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email">{c.email}</InfoRow>
              <InfoRow icon={<Megaphone className="w-4 h-4" />} label="Campaign">{c.assignedCampaign}</InfoRow>
              <InfoRow icon={<Bot className="w-4 h-4" />} label="AI Agent">{c.assignedAgent}</InfoRow>
              <InfoRow label="Sentiment">
                <span className={`inline-flex items-center gap-1.5 ${sentiment.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sentiment.dot}`} />
                  {c.sentiment}
                </span>
              </InfoRow>
            </div>
          </div>

          {/* Last call summary */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Last Call Summary</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed rounded-xl border border-slate-100 bg-white p-4">
              {c.lastCallSummary}
            </p>
          </div>

          {/* Next follow-up */}
          <div className="rounded-xl border border-indigo-100/70 bg-indigo-50/40 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-indigo-100/60 flex items-center justify-center shrink-0">
              <CalendarClock className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Next Follow-up</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{c.nextFollowUp}</div>
            </div>
          </div>

          {/* Recent notes */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Recent Notes</h3>
            {c.notes.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                No notes yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {c.notes.map((note) => (
                  <div key={note.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5">
                    <StickyNote className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{note.text}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{note.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
