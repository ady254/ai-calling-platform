import React from 'react';
import Link from 'next/link';
import { Megaphone, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState() {
  return (
    <div className="w-full bg-white rounded-2xl p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center text-center min-h-[380px]">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-6">
        <Megaphone className="w-8 h-8 text-indigo-500" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 font-sans tracking-tight mb-2">
        No active campaigns
      </h3>
      
      <p className="text-slate-400 text-sm font-medium max-w-sm mb-8 leading-relaxed">
        Create your first campaign to start making AI calls, tracking performance, and generating business pipeline in real time.
      </p>
      
      <Link href="/dashboard/campaigns" passHref>
        <Button variant="primary" size="md" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </Link>
    </div>
  );
}
