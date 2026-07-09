import { WizardCampaignState } from "@/types/campaign-wizard";
import { useAgents } from "@/hooks/useAgent";

interface ReviewSummaryProps {
    data: WizardCampaignState;
}

export default function ReviewSummary({ data }: ReviewSummaryProps) {
    const { agents } = useAgents();
    
    const agentName = data.agent_id 
        ? agents.find(a => a.id === data.agent_id)?.name || "Unknown Agent" 
        : "Manual Config";

    const voiceName = data.ai_voice === "qtqlHrXyBpEXHx2JBPgx" ? "Emily" 
        : data.ai_voice === "hpp4J3VqNfWAUOO0d1Us" ? "Bella" 
        : "Matilda";

    const estimatedDuration = Math.ceil(data.contact_ids.length * 2.5);
    const approxCost = (data.contact_ids.length * 0.08).toFixed(2);

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">Campaign Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                    <div className="text-sm text-slate-500 mb-1">Campaign Name</div>
                    <div className="font-semibold text-slate-800">{data.name || "Untitled Campaign"}</div>
                </div>
                
                <div>
                    <div className="text-sm text-slate-500 mb-1">Objective</div>
                    <div className="font-semibold text-slate-800">{data.objective || "Not specified"}</div>
                </div>

                <div>
                    <div className="text-sm text-slate-500 mb-1">AI Agent</div>
                    <div className="font-semibold text-slate-800">{agentName}</div>
                </div>
                
                <div>
                    <div className="text-sm text-slate-500 mb-1">Voice</div>
                    <div className="font-semibold text-slate-800">{voiceName} ({data.language})</div>
                </div>

                <div>
                    <div className="text-sm text-slate-500 mb-1">Contacts</div>
                    <div className="font-semibold text-slate-800">{data.contact_ids.length}</div>
                </div>
                
                <div>
                    <div className="text-sm text-slate-500 mb-1">Schedule</div>
                    <div className="font-semibold text-slate-800">{data.schedule} ({data.timezone})</div>
                </div>
                
                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Expected Duration</div>
                        <div className="font-semibold text-emerald-600">{estimatedDuration} min</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 mb-1">Expected Cost</div>
                        <div className="font-semibold text-amber-600">${approxCost}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
