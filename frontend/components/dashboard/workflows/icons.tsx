import React from 'react';
import {
  Play, PhoneCall, CalendarCheck, UserCheck, PhoneOff, MessageSquare, CalendarClock,
  BookOpen, Gauge, Smile, TrendingUp, Briefcase, Wallet, Languages, UserCog, GitBranch,
  Mail, MessageCircle, CalendarPlus, Database, UserPlus, Hash, Calendar, FileText,
  CheckSquare, Webhook, Clock, Timer, Filter, GitMerge, Split, Repeat, Headphones,
  Send, PhoneMissed, Receipt, ClipboardList, HeartPulse, Sparkles, Zap, Bell,
} from 'lucide-react';
import { NodeCategory } from '@/types/workflow-studio';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // triggers
  play: Play, 'phone-call': PhoneCall, 'calendar-check': CalendarCheck, 'user-check': UserCheck,
  'phone-off': PhoneOff, 'message-square': MessageSquare, 'calendar-clock': CalendarClock, 'book-open': BookOpen,
  // ai logic
  gauge: Gauge, smile: Smile, 'trending-up': TrendingUp, briefcase: Briefcase, wallet: Wallet,
  languages: Languages, 'user-cog': UserCog, 'git-branch': GitBranch,
  // actions
  mail: Mail, 'message-circle': MessageCircle, 'calendar-plus': CalendarPlus, database: Database,
  'user-plus': UserPlus, hash: Hash, calendar: Calendar, 'file-text': FileText, 'check-square': CheckSquare, webhook: Webhook,
  // utilities
  clock: Clock, timer: Timer, filter: Filter, 'git-merge': GitMerge, split: Split, repeat: Repeat,
  // templates / misc
  headphones: Headphones, send: Send, 'phone-missed': PhoneMissed, receipt: Receipt,
  'clipboard-list': ClipboardList, 'heart-pulse': HeartPulse, sparkles: Sparkles, zap: Zap, bell: Bell,
};

export function NodeIcon({ icon, className = 'w-4 h-4' }: { icon: string; className?: string }) {
  const Cmp = ICONS[icon] ?? Zap;
  return <Cmp className={className} />;
}

export interface CategoryStyle {
  label: string;
  icon: string; // text color
  bg: string; // icon container bg + border
  chip: string; // small chip
  ring: string;
  dot: string;
}

export const CATEGORY_STYLE: Record<NodeCategory, CategoryStyle> = {
  trigger: {
    label: 'Trigger',
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100/70',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-100/70',
    ring: 'ring-emerald-300',
    dot: 'bg-emerald-500',
  },
  'ai-logic': {
    label: 'AI Logic',
    icon: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-100/70',
    chip: 'bg-indigo-50 text-indigo-700 border-indigo-100/70',
    ring: 'ring-indigo-300',
    dot: 'bg-indigo-500',
  },
  action: {
    label: 'Action',
    icon: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-100/70',
    chip: 'bg-blue-50 text-blue-700 border-blue-100/70',
    ring: 'ring-blue-300',
    dot: 'bg-blue-500',
  },
  utility: {
    label: 'Utility',
    icon: 'text-slate-600',
    bg: 'bg-slate-100 border-slate-200/70',
    chip: 'bg-slate-100 text-slate-600 border-slate-200/70',
    ring: 'ring-slate-300',
    dot: 'bg-slate-400',
  },
};
