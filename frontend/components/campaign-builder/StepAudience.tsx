import { WizardCampaignState } from "@/types/campaign-wizard";
import { useContacts } from "@/hooks/useContact";
import EstimationCard from "./EstimationCard";
import { Upload, Filter, Tag } from "lucide-react";

interface StepAudienceProps {
    data: WizardCampaignState;
    updateData: (updates: Partial<WizardCampaignState>) => void;
}

export default function StepAudience({ data, updateData }: StepAudienceProps) {
    const { contacts } = useContacts();

    const toggleContact = (id: string) => {
        const newContacts = data.contact_ids.includes(id) 
            ? data.contact_ids.filter(c => c !== id) 
            : [...data.contact_ids, id];
        updateData({ contact_ids: newContacts });
    };

    const toggleAll = () => {
        if (data.contact_ids.length === contacts.length) {
            updateData({ contact_ids: [] });
        } else {
            updateData({ contact_ids: contacts.map(c => c.id) });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Audience</h2>
                <p className="text-slate-500 mt-1">Select the contacts to include in this campaign.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex gap-4">
                        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                            <Upload className="w-4 h-4" /> Import CSV
                        </button>
                        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                            <Filter className="w-4 h-4" /> Filters
                        </button>
                        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                            <Tag className="w-4 h-4" /> Tags
                        </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox"
                                    checked={data.contact_ids.length > 0 && data.contact_ids.length === contacts.length}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-bold text-slate-700">All Contacts</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">{contacts.length} Available</span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                            {contacts.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No contacts available.</div>
                            ) : (
                                contacts.map(contact => (
                                    <label 
                                        key={contact.id} 
                                        className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${data.contact_ids.includes(contact.id) ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={data.contact_ids.includes(contact.id)}
                                            onChange={() => toggleContact(contact.id)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <div className="font-semibold text-slate-800 text-sm">{contact.name}</div>
                                            <div className="text-xs text-slate-500">{contact.phone_number} • {contact.company || "No company"}</div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <EstimationCard contactCount={data.contact_ids.length} />
                </div>
            </div>
        </div>
    );
}
