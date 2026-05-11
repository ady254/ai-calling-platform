"use client";

import { useState } from "react";
import { useAgents } from "../../../hooks/useAgent";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, User, Mic, Settings, Trash2, Edit2, Play, Languages } from "lucide-react";
import { AgentCreate } from "../../../types/agent";

export default function AgentConfigurationClient() {
    const { agents, loading, error, addAgent, removeAgent, editAgent } = useAgents();
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<AgentCreate>({
        name: "",
        description: "",
        system_prompt: "",
        language: "en",
        voice_id: "alloy",
        stability: 0.5,
        similarity_boost: 0.75
    });

    if (loading) return <div className="p-8">Loading agents...</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await editAgent(editingId, formData);
                alert("Agent updated successfully!");
            } else {
                await addAgent(formData);
                alert("Agent created successfully!");
            }
            setShowModal(false);
            resetForm();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            system_prompt: "",
            language: "en",
            voice_id: "alloy",
            stability: 0.5,
            similarity_boost: 0.75
        });
        setEditingId(null);
    };

    const handleEdit = (agent: any) => {
        setFormData({
            name: agent.name,
            description: agent.description,
            system_prompt: agent.system_prompt,
            language: agent.language,
            voice_id: agent.voice_id,
            stability: agent.stability,
            similarity_boost: agent.similarity_boost
        });
        setEditingId(agent.id);
        setShowModal(true);
    };

    return (
        <div className="w-full">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Agent Configuration</h1>
                    <p className="text-slate-500 mt-2">Design and manage your AI agent personas.</p>
                </div>
                <Button className="gap-2 rounded-full px-6 py-6 h-auto" onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus className="w-5 h-5" />
                    Create New Agent
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <Card key={agent.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-100 flex flex-col">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(agent)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { if(confirm("Delete agent?")) removeAgent(agent.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">{agent.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{agent.description || "No description provided."}</p>
                            
                            <div className="space-y-3 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mic className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium capitalize">{agent.voice_id} Voice</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Languages className="w-4 h-4 text-slate-400" />
                                    <span className="font-medium uppercase">{agent.language}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-400">Created {new Date(agent.created_at).toLocaleDateString()}</span>
                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1 text-xs">
                                <Play className="w-3 h-3" />
                                Preview Voice
                            </Button>
                        </div>
                    </Card>
                ))}

                {agents.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                        <User className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No agents configured yet</p>
                        <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 underline" onClick={() => setShowModal(true)}>Create your first persona</Button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">{editingId ? "Edit Agent" : "Create Agent"}</h2>
                                <p className="text-slate-500 mt-1">Define your agent's personality and voice.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <Plus className="w-8 h-8 rotate-45 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Agent Name *</label>
                                    <input 
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg"
                                        placeholder="e.g. Sarah from Healthcare"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Language</label>
                                    <select 
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg appearance-none"
                                        value={formData.language}
                                        onChange={e => setFormData({...formData, language: e.target.value})}
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Short Description</label>
                                <input 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Briefly describe this agent's role..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">System Prompt *</label>
                                <textarea 
                                    required
                                    rows={6}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed"
                                    placeholder="You are a helpful assistant..."
                                    value={formData.system_prompt}
                                    onChange={e => setFormData({...formData, system_prompt: e.target.value})}
                                />
                                <p className="text-xs text-slate-400 ml-1 italic">This is the most important part. Tell the AI how to behave.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings className="w-5 h-5 text-indigo-600" />
                                    <h4 className="font-bold text-slate-800">Voice & Style Settings</h4>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-600 flex justify-between">
                                            Voice Model
                                        </label>
                                        <select 
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none shadow-sm"
                                            value={formData.voice_id}
                                            onChange={e => setFormData({...formData, voice_id: e.target.value})}
                                        >
                                            <option value="alloy">Alloy (Neutral)</option>
                                            <option value="echo">Echo (Warm)</option>
                                            <option value="fable">Fable (British)</option>
                                            <option value="onyx">Onyx (Deep)</option>
                                            <option value="nova">Nova (Bright)</option>
                                            <option value="shimmer">Shimmer (Soft)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-600 flex justify-between">
                                            Stability <span>{Math.round((formData.stability || 0) * 100)}%</span>
                                        </label>
                                        <input 
                                            type="range" min="0" max="1" step="0.01"
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            value={formData.stability}
                                            onChange={e => setFormData({...formData, stability: parseFloat(e.target.value)})}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-slate-600 flex justify-between">
                                            Similarity Boost <span>{Math.round((formData.similarity_boost || 0) * 100)}%</span>
                                        </label>
                                        <input 
                                            type="range" min="0" max="1" step="0.01"
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            value={formData.similarity_boost}
                                            onChange={e => setFormData({...formData, similarity_boost: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1 py-6 rounded-2xl border-2" onClick={() => setShowModal(false)}>
                                    Discard Changes
                                </Button>
                                <Button type="submit" className="flex-1 py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : (editingId ? "Update Agent Persona" : "Launch AI Agent")}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
