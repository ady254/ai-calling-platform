"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCampaigns } from "@/hooks/useCampaign";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { WizardCampaignState, initialWizardState } from "@/types/campaign-wizard";
import CampaignStepper from "./CampaignStepper";
import StepCampaignDetails from "./StepCampaignDetails";
import StepAIAgent from "./StepAIAgent";
import StepAudience from "./StepAudience";
import StepReview from "./StepReview";
import SuccessScreen from "./SuccessScreen";

const WIZARD_STEPS = [
    "Campaign Details",
    "AI Agent",
    "Audience",
    "Review & Launch"
];

export default function CampaignWizard() {
    const router = useRouter();
    const { addCampaign } = useCampaigns();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<WizardCampaignState>(initialWizardState);

    // Load state from sessionStorage to persist across refreshes/navigation within wizard
    useEffect(() => {
        const savedData = sessionStorage.getItem('campaignWizardState');
        const savedStep = sessionStorage.getItem('campaignWizardStep');
        if (savedData) setData(JSON.parse(savedData));
        if (savedStep) setCurrentStep(parseInt(savedStep));
    }, []);

    // Save state on changes
    useEffect(() => {
        sessionStorage.setItem('campaignWizardState', JSON.stringify(data));
        sessionStorage.setItem('campaignWizardStep', currentStep.toString());
    }, [data, currentStep]);

    const updateData = (updates: Partial<WizardCampaignState>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const validateStep = () => {
        if (currentStep === 1) {
            if (!data.name) {
                toast.error("Campaign Name is required.");
                return false;
            }
        }
        if (currentStep === 2) {
            if (!data.agent_id && !data.ai_prompt) {
                toast.error("Please provide a System Prompt or choose an Agent.");
                return false;
            }
        }
        if (currentStep === 3) {
            // Technically 0 contacts could be allowed, but usually you want at least 1.
            // Keeping it optional for now, but a warning could be nice.
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) return;
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.back();
        }
    };

    const handleLaunch = async () => {
        if (!validateStep()) return;
        
        if (!confirm("Are you sure you want to launch this campaign?")) {
            return;
        }

        setIsLoading(true);
        try {
            // Only send the fields supported by the backend CampaignCreate payload
            const payload = {
                name: data.name,
                objective: data.objective,
                description: data.description,
                agent_id: data.agent_id || undefined,
                language: data.language,
                ai_voice: data.ai_voice,
                max_retries: data.max_retries,
                ai_prompt: data.ai_prompt,
                contact_ids: data.contact_ids,
                // Include businessType etc in description or ignore for now as requested by user
                // "The UI should be designed as if these fields are first-class product features, but the backend should continue receiving only the currently supported payload."
            };
            
            await addCampaign(payload as any);
            setIsSuccess(true);
            sessionStorage.removeItem('campaignWizardState');
            sessionStorage.removeItem('campaignWizardStep');
        } catch (error: any) {
            toast.error(`Couldn't create campaign: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setData(initialWizardState);
        setCurrentStep(1);
        setIsSuccess(false);
    };

    if (isSuccess) {
        return (
            <Card className="max-w-4xl mx-auto p-12">
                <SuccessScreen onReset={handleReset} />
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <CampaignStepper currentStep={currentStep} steps={WIZARD_STEPS} />
            
            <Card className="p-8 shadow-sm">
                <div className="min-h-[400px]">
                    {currentStep === 1 && <StepCampaignDetails data={data} updateData={updateData} />}
                    {currentStep === 2 && <StepAIAgent data={data} updateData={updateData} />}
                    {currentStep === 3 && <StepAudience data={data} updateData={updateData} />}
                    {currentStep === 4 && <StepReview data={data} />}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleBack}
                        disabled={isLoading}
                        className="text-slate-500 font-semibold"
                    >
                        {currentStep === 1 ? "Cancel" : "Back"}
                    </Button>
                    
                    {currentStep < 4 ? (
                        <Button 
                            type="button" 
                            onClick={handleNext}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8"
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button 
                            type="button" 
                            onClick={handleLaunch}
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-sm shadow-indigo-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Launch Campaign"
                            )}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
