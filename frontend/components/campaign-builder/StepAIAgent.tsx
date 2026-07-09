import { WizardCampaignState } from "@/types/campaign-wizard";
import { useAgents } from "@/hooks/useAgent";
import { User, Sparkles, Settings2 } from "lucide-react";

interface StepAIAgentProps {
    data: WizardCampaignState;
    updateData: (updates: Partial<WizardCampaignState>) => void;
}

export default function StepAIAgent({ data, updateData }: StepAIAgentProps) {
    const { agents } = useAgents();
    const isManual = !data.agent_id;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">AI Agent</h2>
                <p className="text-slate-500 mt-1">Configure how your AI agent behaves and sounds.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Choose Agent</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => updateData({ agent_id: "" })}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                isManual 
                                ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" 
                                : "border-slate-100 bg-white hover:border-slate-300 text-slate-600"
                            }`}
                        >
                            <Settings2 className={`w-6 h-6 mb-2 ${isManual ? "text-indigo-600" : "text-slate-400"}`} />
                            <span className="font-semibold text-sm">Manual Prompt</span>
                        </button>
                        
                        {agents.map(agent => {
                            const isSelected = data.agent_id === agent.id;
                            return (
                                <button
                                    key={agent.id}
                                    type="button"
                                    onClick={() => updateData({ agent_id: agent.id })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                        isSelected 
                                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" 
                                        : "border-slate-100 bg-white hover:border-slate-300 text-slate-600"
                                    }`}
                                >
                                    <User className={`w-6 h-6 mb-2 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                                    <span className="font-semibold text-sm">{agent.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isManual && (
                    <div className="space-y-6 animate-in fade-in duration-300 mt-8 pt-6 border-t border-slate-100">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">System Prompt *</label>
                            <textarea 
                                value={data.ai_prompt}
                                onChange={e => updateData({ ai_prompt: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[120px] font-mono text-sm"
                                placeholder="You are a helpful assistant..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Knowledge Base</label>
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <input 
                                        type="file" 
                                        className="text-sm text-slate-500 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Voice</label>
                                <select 
                                    value={data.ai_voice}
                                    onChange={e => updateData({ ai_voice: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="qtqlHrXyBpEXHx2JBPgx">Emily (Neutral)</option>
                                    <option value="hpp4J3VqNfWAUOO0d1Us">Bella (Warm)</option>
                                    <option value="XrExE9yKIg1WjnnlVkGX">Matilda (Professional)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Language</label>
                                <select 
                                    value={data.language}
                                    onChange={e => updateData({ language: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="en">English (US)</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="hi">Hindi</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Speaking Style</label>
                                <select 
                                    value={data.speakingStyle}
                                    onChange={e => updateData({ speakingStyle: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="Professional">Professional</option>
                                    <option value="Friendly">Friendly</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Max Retries</label>
                                <input 
                                    type="number"
                                    value={data.max_retries}
                                    onChange={e => updateData({ max_retries: parseInt(e.target.value) || 0 })}
                                    min={1} max={5}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
