import { Calculator, Clock, DollarSign, Users } from "lucide-react";

interface EstimationCardProps {
    contactCount: number;
}

export default function EstimationCard({ contactCount }: EstimationCardProps) {
    // Estimation logic
    const avgDurationMins = 2.5;
    const avgCostPerCall = 0.08;
    
    const estimatedCalls = contactCount;
    const estimatedDuration = Math.ceil(contactCount * avgDurationMins);
    const approxCost = (contactCount * avgCostPerCall).toFixed(2);

    return (
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Calculator className="w-32 h-32" />
            </div>
            
            <h3 className="font-semibold text-slate-300 flex items-center gap-2 mb-6">
                <Calculator className="w-4 h-4" />
                Campaign Estimation
            </h3>

            <div className="space-y-6">
                <div>
                    <div className="text-slate-400 text-sm mb-1">Total Contacts</div>
                    <div className="text-3xl font-bold flex items-center gap-3">
                        {estimatedCalls}
                        <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                    <div>
                        <div className="text-slate-400 text-sm mb-1">Estimated Duration</div>
                        <div className="text-xl font-bold flex items-center gap-2">
                            {estimatedDuration} min
                            <Clock className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-400 text-sm mb-1">Approx Cost</div>
                        <div className="text-xl font-bold flex items-center gap-2">
                            ${approxCost}
                            <DollarSign className="w-4 h-4 text-amber-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
