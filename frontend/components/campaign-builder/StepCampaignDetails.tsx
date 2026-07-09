import { WizardCampaignState } from "@/types/campaign-wizard";

interface StepCampaignDetailsProps {
    data: WizardCampaignState;
    updateData: (updates: Partial<WizardCampaignState>) => void;
}

export default function StepCampaignDetails({ data, updateData }: StepCampaignDetailsProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Campaign Details</h2>
                <p className="text-slate-500 mt-1">Let's start with the basics of your campaign.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Campaign Name *</label>
                    <input 
                        type="text"
                        value={data.name}
                        onChange={e => updateData({ name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g. Appointment Confirmation"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Campaign Goal</label>
                    <input 
                        type="text"
                        value={data.objective}
                        onChange={e => updateData({ objective: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g. Confirm appointments"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Business Type</label>
                        <select 
                            value={data.businessType}
                            onChange={e => updateData({ businessType: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="">Select a type...</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Clinic">Clinic</option>
                            <option value="Real Estate">Real Estate</option>
                            <option value="SaaS">SaaS</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Timezone</label>
                        <select 
                            value={data.timezone}
                            onChange={e => updateData({ timezone: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                            <option value="UTC">UTC</option>
                            <option value="EST">EST</option>
                            <option value="CST">CST</option>
                            <option value="PST">PST</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Campaign Schedule</label>
                    <div className="flex gap-4">
                        {['Immediately', 'Tomorrow', 'Custom'].map(option => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => updateData({ schedule: option })}
                                className={`px-5 py-3 rounded-xl border font-medium transition-all ${
                                    data.schedule === option 
                                    ? "bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600" 
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
