import { WizardCampaignState } from "@/types/campaign-wizard";
import ReviewSummary from "./ReviewSummary";

interface StepReviewProps {
    data: WizardCampaignState;
}

export default function StepReview({ data }: StepReviewProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Review & Launch</h2>
                <p className="text-slate-500 mt-1">Verify your campaign details before launching.</p>
            </div>

            <ReviewSummary data={data} />
            
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3">
                <div className="text-indigo-600 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900">Ready to Launch</h4>
                    <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                        Clicking Launch Campaign will create this campaign. Automatic calling will only start based on your backend configuration. 
                    </p>
                </div>
            </div>
        </div>
    );
}
