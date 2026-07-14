// Prop-driven contracts for the AI Workflow Studio. Components consume these
// shapes only, so the page can be wired to the backend without UI changes.

export type NodeCategory = 'trigger' | 'ai-logic' | 'action' | 'utility';

export interface NodeDef {
  id: string; // def id, e.g. "trigger.call-completed"
  category: NodeCategory;
  label: string;
  icon: string; // icon key (see components/dashboard/workflows/icons.tsx)
  description?: string;
}

export interface CanvasNode {
  id: string; // instance id
  defId: string;
  category: NodeCategory;
  label: string;
  icon: string;
  subtitle?: string; // short config summary shown on the card
}

export interface NodeLibrarySection {
  category: NodeCategory;
  title: string;
  nodes: NodeDef[];
}

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export interface WorkflowVersion {
  id: string;
  label: string; // "v3"
  date: string; // ISO
  author: string;
  note: string;
  current?: boolean;
}

// The AI Employee Memory feature — learned adaptations from past executions.
export interface MemoryEntry {
  id: string;
  source: string; // "Hospital A"
  observation: string; // "Customers answer after 5 PM"
  adaptation: string; // "Schedules calls after 5 PM"
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  runs: number;
  successRate: number; // percent
  avgDuration: string; // "1.8s"
  createdBy: string;
  lastModified: string; // ISO
  learnFromExecutions: boolean;
  nodes: CanvasNode[];
  versions: WorkflowVersion[];
  memory: MemoryEntry[];
}

export type WFKPIIcon =
  | 'active'
  | 'executions'
  | 'success'
  | 'failed'
  | 'time'
  | 'followups';

export interface WorkflowKPI {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon: WFKPIIcon;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
}

export type ExecutionStatus = 'success' | 'failed' | 'running';

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: ExecutionStatus;
  executedAt: string; // ISO
  duration: string; // "1.4s"
  triggeredBy: string;
}

export interface WorkflowRecommendation {
  id: string;
  text: string;
}

export type NodeTestStatus = 'idle' | 'pending' | 'running' | 'success' | 'error';

export interface NodeTestResult {
  status: NodeTestStatus;
  durationMs?: number;
  output?: string;
}

export interface WorkflowStudioData {
  kpis: WorkflowKPI[];
  templates: WorkflowTemplate[];
  library: NodeLibrarySection[];
  workflows: Workflow[];
  executions: WorkflowExecution[];
  recommendations: WorkflowRecommendation[];
}
