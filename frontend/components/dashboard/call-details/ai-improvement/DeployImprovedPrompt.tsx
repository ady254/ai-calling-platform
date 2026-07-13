"use client";

import React, { useState } from 'react';
import { Rocket, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { ConversionForecastData } from '@/types/call-details';

interface DeployImprovedPromptProps {
  fromVersion: string;
  toVersion: string;
  target: string; // e.g. campaign name the prompt is applied to
  forecast: ConversionForecastData;
  onDeploy?: () => void;
}

export default function DeployImprovedPrompt({
  fromVersion,
  toVersion,
  target,
  forecast,
  onDeploy,
}: DeployImprovedPromptProps) {
  const [deployed, setDeployed] = useState(false);
  const upliftPts = +(forecast.projectedRate - forecast.currentRate).toFixed(1);

  const handleDeploy = () => {
    setDeployed(true);
    onDeploy?.();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_24px_60px_-24px_rgba(99,102,241,0.65)] ring-1 ring-white/15">
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight">Deploy Improved Prompt</h3>
            <p className="text-white/80 text-sm font-medium mt-1 max-w-xl leading-relaxed">
              Roll out the suggested rewrite to future calls in one click. Expected{' '}
              <span className="font-bold text-white">+{upliftPts} pts</span> conversion on{' '}
              <span className="font-semibold">{target}</span>.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 border border-white/10 px-2.5 py-1 rounded-full">
                {fromVersion}
                <ArrowRight className="w-3 h-3" />
                {toVersion}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75">
                <ShieldCheck className="w-3.5 h-3.5" />
                Reversible · applies to next calls only
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {deployed ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 border border-white/20 text-white font-semibold text-sm">
              <Check className="w-4 h-4" />
              {toVersion} deployed
            </div>
          ) : (
            <button
              onClick={handleDeploy}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold text-sm hover:bg-white/90 shadow-sm transition-all active:scale-[0.98]"
            >
              <Rocket className="w-4 h-4" />
              Deploy Improved Prompt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
