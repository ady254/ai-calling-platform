"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, LayoutTemplate, Workflow as WorkflowIcon } from "lucide-react";

import WorkflowHeader from "@/components/dashboard/workflows/WorkflowHeader";
import WorkflowKPIs from "@/components/dashboard/workflows/WorkflowKPIs";
import TemplateGallery from "@/components/dashboard/workflows/TemplateGallery";
import NodeLibrary from "@/components/dashboard/workflows/NodeLibrary";
import WorkflowCanvas from "@/components/dashboard/workflows/WorkflowCanvas";
import InspectorPanel from "@/components/dashboard/workflows/InspectorPanel";
import AIWorkflowAssistant from "@/components/dashboard/workflows/AIWorkflowAssistant";
import WorkflowDetails from "@/components/dashboard/workflows/WorkflowDetails";
import VersionHistory from "@/components/dashboard/workflows/VersionHistory";
import AIRecommendations from "@/components/dashboard/workflows/AIRecommendations";
import ExecutionTable from "@/components/dashboard/workflows/ExecutionTable";

import { CanvasNode, NodeDef, NodeTestResult, Workflow } from "@/types/workflow-studio";
import { mockWorkflowData } from "@/utils/mockWorkflow";

const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `n-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Turn a natural-language description (assistant or template) into a node flow.
function buildNodesFromText(text: string): CanvasNode[] {
  const p = text.toLowerCase();
  const nodes: CanvasNode[] = [];
  const add = (defId: string, category: CanvasNode["category"], label: string, icon: string, subtitle: string) =>
    nodes.push({ id: uid(), defId, category, label, icon, subtitle });

  if (p.includes("appointment")) add("trigger.appointment-booked", "trigger", "Appointment Booked", "calendar-check", "Hospital campaign");
  else if (p.includes("missed") || p.includes("fail")) add("trigger.call-failed", "trigger", "Call Failed", "phone-off", "Any campaign");
  else if (p.includes("lead") || p.includes("qualif")) add("trigger.lead-qualified", "trigger", "Lead Qualified", "user-check", "Score > 75");
  else if (p.includes("feedback") || p.includes("support")) add("trigger.call-completed", "trigger", "Call Completed", "phone-call", "Any call");
  else add("trigger.call-completed", "trigger", "Call Completed", "phone-call", "Any call");

  if (p.includes("positive") || p.includes("sentiment")) add("ai.sentiment", "ai-logic", "Sentiment", "smile", "Is Positive");
  if (p.includes("intent") || p.includes("buying")) add("ai.buying-intent", "ai-logic", "Buying Intent", "trending-up", "Is High");

  if (p.includes("whatsapp")) add("action.whatsapp", "action", "Send WhatsApp", "message-circle", "Confirmation");
  if (p.includes("email")) add("action.send-email", "action", "Send Email", "mail", "Personalized");
  if (p.includes("notify") || p.includes("reception") || p.includes("slack")) add("action.notify-slack", "action", "Notify Slack", "hash", "#reception");
  if (p.includes("proposal")) add("action.generate-proposal", "action", "Generate Proposal", "file-text", "PDF");
  if (p.includes("task")) add("action.create-task", "action", "Create Task", "check-square", "For sales");
  if (p.includes("crm")) add("action.update-crm", "action", "Update CRM", "database", "Contact record");
  if (p.includes("book") || p.includes("calendar")) add("action.book-calendar", "action", "Book Calendar", "calendar", "Meeting slot");

  if (p.includes("follow") || p.includes("reminder") || p.includes("day before")) {
    add("utility.delay", "utility", "Delay", "clock", "Until 1 day before");
    add("action.schedule-followup", "action", "Schedule Follow-up", "calendar-plus", "Reminder");
  }

  if (nodes.length <= 1) add("action.send-email", "action", "Send Email", "mail", "Personalized");
  return nodes;
}

export default function WorkflowStudioPage() {
  const data = mockWorkflowData;
  const [workflow, setWorkflow] = useState<Workflow>(data.workflows[0]);
  const [nodes, setNodes] = useState<CanvasNode[]>(data.workflows[0]?.nodes ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, NodeTestResult>>({});
  const [testing, setTesting] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const hasWorkflows = data.workflows.length > 0;
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const hasTrigger = nodes[0]?.category === "trigger";

  // ── Node mutations ──────────────────────────────────────────────────
  const addNode = (def: NodeDef) => {
    const node: CanvasNode = { id: uid(), defId: def.id, category: def.category, label: def.label, icon: def.icon, subtitle: "" };
    setNodes((ns) => [...ns, node]);
    setSelectedNodeId(node.id);
  };
  const deleteNode = (id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setSelectedNodeId((cur) => (cur === id ? null : cur));
  };
  const rename = (id: string, label: string) => setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, label } : n)));
  const updateSubtitle = (id: string, subtitle: string) =>
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, subtitle } : n)));

  // ── Test simulation ─────────────────────────────────────────────────
  const runTest = async () => {
    if (nodes.length === 0 || testing) return;
    setTesting(true);
    setTestResults({});
    for (const node of nodes) {
      setTestResults((prev) => ({ ...prev, [node.id]: { status: "running" } }));
      await sleep(380 + Math.random() * 320);
      const durationMs = Math.round(160 + Math.random() * 900);
      setTestResults((prev) => ({ ...prev, [node.id]: { status: "success", durationMs, output: '{\n  "status": "ok",\n  "delivered": true\n}' } }));
    }
    setTesting(false);
    toast.success("Test completed — all nodes passed");
  };

  // ── AI generation ───────────────────────────────────────────────────
  const generateWorkflow = async (prompt: string) => {
    setGenerating(true);
    await sleep(1100);
    setNodes(buildNodesFromText(prompt));
    setSelectedNodeId(null);
    setTestResults({});
    setGenerating(false);
    setAssistantOpen(false);
    toast.success("Workflow generated from your description");
  };

  const useTemplate = (name: string, description: string) => {
    setNodes(buildNodesFromText(`${name} ${description}`));
    setSelectedNodeId(null);
    setTestResults({});
    toast.success(`Loaded the ${name} template`);
    if (typeof window !== "undefined") window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const toggleLearning = (enabled: boolean) => {
    setWorkflow((w) => ({ ...w, learnFromExecutions: enabled }));
    toast.success(enabled ? "Learning enabled — the AI will adapt from executions" : "Learning disabled");
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-10">
      <WorkflowHeader
        onNew={() => {
          setNodes([]);
          setSelectedNodeId(null);
          setTestResults({});
          toast("New workflow — start adding nodes");
        }}
        onTemplates={() => window.scrollTo({ top: 220, behavior: "smooth" })}
        onImport={() => toast("Import a workflow JSON")}
      />

      <WorkflowKPIs cards={data.kpis} />

      {!hasWorkflows ? (
        <EmptyState onCreate={() => toast("Create a workflow")} onBrowse={() => toast("Browse templates")} />
      ) : (
        <>
          <TemplateGallery templates={data.templates} onUse={(t) => useTemplate(t.name, t.description)} />

          {/* Builder: Node library | Canvas | Inspector */}
          <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_340px] gap-4 xl:h-[680px]">
            <div className="h-[440px] xl:h-full">
              <NodeLibrary sections={data.library} onAddNode={addNode} />
            </div>
            <div className="h-[540px] xl:h-full">
              <WorkflowCanvas
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                testResults={testResults}
                testing={testing}
                onSelectNode={setSelectedNodeId}
                onDeleteNode={deleteNode}
                onRunTest={runTest}
                onOpenAssistant={() => setAssistantOpen(true)}
              />
            </div>
            <div className="h-[480px] xl:h-full">
              <InspectorPanel
                selectedNode={selectedNode}
                nodeCount={nodes.length}
                hasTrigger={hasTrigger}
                testResults={testResults}
                onRename={rename}
                onUpdateSubtitle={updateSubtitle}
              />
            </div>
          </div>

          {/* Details + Version history */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WorkflowDetails workflow={workflow} onToggleLearning={toggleLearning} />
            </div>
            <VersionHistory
              versions={workflow.versions}
              onRestore={(v) => toast.success(`Restored ${v.label}`)}
              onCompare={(v) => toast(`Comparing ${v.label} with current`)}
            />
          </div>

          {/* AI recommendations */}
          <AIRecommendations recommendations={data.recommendations} />

          {/* Recent executions */}
          <ExecutionTable executions={data.executions} onViewDetails={(e) => toast(`Opening ${e.workflowName} run`)} />
        </>
      )}

      <AIWorkflowAssistant
        open={assistantOpen}
        generating={generating}
        onClose={() => setAssistantOpen(false)}
        onGenerate={generateWorkflow}
      />
    </div>
  );
}

function EmptyState({ onCreate, onBrowse }: { onCreate: () => void; onBrowse: () => void }) {
  return (
    <div className="w-full bg-white rounded-2xl p-10 border border-slate-200/70 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.24)] flex flex-col items-center justify-center text-center min-h-[420px]">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center mb-6">
        <WorkflowIcon className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 font-sans tracking-tight mb-2">No workflows created</h3>
      <p className="text-slate-400 text-sm font-medium max-w-md mb-8 leading-relaxed">
        Start with a template or describe what you want your AI employee to automate.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
        <button
          onClick={onBrowse}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 transition-all"
        >
          <LayoutTemplate className="w-4 h-4" />
          Browse Templates
        </button>
      </div>
    </div>
  );
}
