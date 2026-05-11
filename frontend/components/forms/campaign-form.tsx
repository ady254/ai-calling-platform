"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCampaigns } from "@/hooks/useCampaign";
import { useContacts } from "@/hooks/useContact";
import { useAgents } from "@/hooks/useAgent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Sparkles } from "lucide-react";

export default function CampaignForm() {
    const router = useRouter();
    const { addCampaign } = useCampaigns();
    const { contacts } = useContacts();
    const { agents } = useAgents();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        objective: "",
        language: "en",
        ai_voice: "alloy",
        ai_prompt: "",
        max_retries: 2,
        agent_id: "",
    });
    
    // The backend will automatically assign the correct business_id based on your auth token.

    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleContact = (id: string) => {
        setSelectedContacts(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                agent_id: formData.agent_id || undefined,
                contact_ids: selectedContacts
            };
            await addCampaign(payload as any);
            alert("Campaign created successfully!");
            router.push("/dashboard/campaigns");
        } catch (error: any) {
            alert(`Error creating campaign: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            <Card className="p-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Campaign Details</h2>
                    <p className="text-sm text-slate-500">Define the core settings for your AI outreach.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Campaign Name *</label>
                        <input 
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            placeholder="e.g. Q3 Healthcare Renewals"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Objective</label>
                        <input 
                            name="objective"
                            value={formData.objective}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            placeholder="e.g. Renew membership"
                        />
                    </div>

                    <div className="space-y-2 col-span-full">
                        <label className="text-sm font-semibold text-slate-700">Description</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[100px]"
                            placeholder="Brief description of the campaign goals..."
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-8">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">AI Configuration</h2>
                        <p className="text-sm text-slate-500">Configure how the AI agent behaves and sounds.</p>
                    </div>
                    {formData.agent_id && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 animate-in fade-in slide-in-from-right-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Persona Active</span>
                        </div>
                    )}
                </div>

                <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1 mb-2 block">Quick Select Agent Persona</label>
                    <div className="relative">
                        <select 
                            name="agent_id"
                            value={formData.agent_id}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none pr-12 font-medium"
                        >
                            <option value="">-- Manual Configuration --</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name} ({agent.voice_id} voice)
                                </option>
                            ))}
                        </select>
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 ml-1 italic">Selecting a persona will use its pre-configured prompt and voice settings.</p>
                </div>

                {!formData.agent_id ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Language</label>
                        <select 
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                            <option value="en">English (US)</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Voice</label>
                        <select 
                            name="ai_voice"
                            value={formData.ai_voice}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                            <option value="alloy">Alloy (Neutral)</option>
                            <option value="echo">Echo (Warm)</option>
                            <option value="nova">Nova (Professional)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Max Retries</label>
                        <input 
                            type="number"
                            name="max_retries"
                            value={formData.max_retries}
                            onChange={handleChange}
                            min={1} max={5}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">System Prompt</label>
                        <textarea 
                            required
                            name="ai_prompt"
                            value={formData.ai_prompt}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[150px] font-mono text-sm"
                            placeholder="You are a helpful assistant for..."
                        />
                    </div>
                </div>
                ) : (
                    <div className="p-8 border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-slate-800">Agent Persona Linked</h4>
                        <p className="text-sm text-slate-500 max-w-xs mt-1">
                            This campaign is using the settings from your selected persona. Manual configuration is hidden.
                        </p>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-4 text-indigo-600"
                            onClick={() => setFormData(prev => ({...prev, agent_id: ""}))}
                        >
                            Switch to Manual Mode
                        </Button>
                    </div>
                )}
            </Card>

            <Card className="p-8">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Target Contacts</h2>
                        <p className="text-sm text-slate-500">Select the contacts to include in this campaign.</p>
                    </div>
                    <div className="text-sm font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        {selectedContacts.length} Selected
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                    {contacts.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">No contacts available. Please add contacts first.</div>
                    ) : (
                        contacts.map(contact => (
                            <div 
                                key={contact.id} 
                                onClick={() => toggleContact(contact.id)}
                                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedContacts.includes(contact.id) ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedContacts.includes(contact.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>
                                    {selectedContacts.includes(contact.id) && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-800">{contact.name}</div>
                                    <div className="text-sm text-slate-500">{contact.phone_number} • {contact.company || "No company"}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Campaign"}
                </Button>
            </div>
        </form>
    );
}