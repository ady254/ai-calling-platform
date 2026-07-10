import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessScreenProps {
    onReset: () => void;
}

export default function SuccessScreen({ onReset }: SuccessScreenProps) {
    const router = useRouter();

    return (
        <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Campaign Created Successfully</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-10">
                Your campaign is ready and scheduled. You can monitor its progress from the dashboard.
            </p>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.push("/dashboard/campaigns")}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                    View Campaign
                </button>
                <button 
                    onClick={onReset}
                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                >
                    Create Another Campaign
                </button>
            </div>
        </div>
    );
}
