import React from 'react';
import { AIImprovementData, KnowledgeAnalysisData } from '@/types/call-details';
import EvaluationScore from './EvaluationScore';
import PromptWeaknesses from './PromptWeaknesses';
import PromptComparison from './PromptComparison';
import ConversionForecast from './ConversionForecast';
import DeployImprovedPrompt from './DeployImprovedPrompt';
import KnowledgeAnalysis from '../KnowledgeAnalysis';

interface AIImprovementTabProps {
  improvement: AIImprovementData;
  knowledge: KnowledgeAnalysisData;
  target: string; // campaign the prompt applies to
  onDeploy?: () => void;
  onUpdateKnowledge?: () => void;
  onCopySuggested?: () => void;
}

export default function AIImprovementTab({
  improvement,
  knowledge,
  target,
  onDeploy,
  onUpdateKnowledge,
  onCopySuggested,
}: AIImprovementTabProps) {
  return (
    <div className="space-y-6">
      {/* 1 — Conversation evaluation (0–100) */}
      <EvaluationScore data={improvement.evaluation} />

      {/* 2 — Weaknesses + 4 — Missing knowledge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromptWeaknesses weaknesses={improvement.weaknesses} />
        <KnowledgeAnalysis data={knowledge} onUpdate={onUpdateKnowledge} />
      </div>

      {/* 3 + 5 — Suggested prompt & version comparison */}
      <PromptComparison data={improvement.comparison} onCopySuggested={onCopySuggested} />

      {/* 6 — Expected conversion improvement */}
      <ConversionForecast data={improvement.forecast} />

      {/* 7 — One-click deploy */}
      <DeployImprovedPrompt
        fromVersion={improvement.comparison.current.version}
        toVersion={improvement.comparison.suggested.version}
        target={target}
        forecast={improvement.forecast}
        onDeploy={onDeploy}
      />
    </div>
  );
}
