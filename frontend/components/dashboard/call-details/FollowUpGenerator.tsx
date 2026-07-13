"use client";

import React, { useState } from 'react';
import { Mail, MessageCircle, Smartphone, Copy, RefreshCw, Clock, Check, Wand2 } from 'lucide-react';
import { FollowUpData, FollowUpChannel } from '@/types/call-details';

interface FollowUpGeneratorProps {
  data: FollowUpData;
  onRegenerate?: (channel: FollowUpChannel) => void;
  onSendLater?: (channel: FollowUpChannel) => void;
}

const TABS: { key: FollowUpChannel; label: string; icon: React.ReactNode }[] = [
  { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
  { key: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
];

export default function FollowUpGenerator({ data, onRegenerate, onSendLater }: FollowUpGeneratorProps) {
  const [channel, setChannel] = useState<FollowUpChannel>('email');
  const [copied, setCopied] = useState(false);

  const message = data.messages.find((m) => m.channel === channel) ?? data.messages[0];

  const handleCopy = async () => {
    const text = message.subject ? `Subject: ${message.subject}\n\n${message.body}` : message.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="bg-white/95 rounded-2xl p-6 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] h-full flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100/50 flex items-center justify-center shrink-0">
          <Wand2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800 font-sans tracking-tight">Follow-up Generator</h3>
          <p className="text-slate-400 text-xs">Personalized from the conversation context.</p>
        </div>
      </div>

      {/* Channel tabs */}
      <div className="bg-slate-100/80 p-0.5 rounded-xl flex items-center border border-slate-200/20 mb-4 self-start">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setChannel(t.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
              channel === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Message preview */}
      <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/40 p-4 mb-4">
        {message.subject && (
          <div className="pb-3 mb-3 border-b border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Subject</span>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{message.subject}</p>
          </div>
        )}
        <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{message.body}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={() => onRegenerate?.(channel)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
        <button
          onClick={() => onSendLater?.(channel)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
        >
          <Clock className="w-4 h-4" />
          Send Later
        </button>
      </div>
    </div>
  );
}
