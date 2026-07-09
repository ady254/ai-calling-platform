import { Check } from "lucide-react";

interface CampaignStepperProps {
    currentStep: number;
    steps: string[];
}

export default function CampaignStepper({ currentStep, steps }: CampaignStepperProps) {
    return (
        <div className="w-full flex items-center justify-between relative mb-12">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-100 -z-10"></div>
            
            <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-indigo-600 -z-10 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;
                
                return (
                    <div key={step} className="flex flex-col items-center gap-3 bg-white px-2">
                        <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                                isCompleted 
                                    ? "bg-indigo-600 text-white" 
                                    : isActive 
                                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100" 
                                        : "bg-slate-100 text-slate-400"
                            }`}
                        >
                            {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                        </div>
                        <div className={`text-xs font-semibold tracking-wide uppercase ${
                            isActive ? "text-indigo-600" : isCompleted ? "text-slate-800" : "text-slate-400"
                        }`}>
                            {step}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
