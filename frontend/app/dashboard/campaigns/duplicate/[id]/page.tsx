"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCampaign } from "@/services/campaign-service";
import CampaignForm from "@/components/forms/campaign-form";

export default function DuplicateCampaignPage() {
    const params = useParams();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await getCampaign(params.id as string);
                setInitialData({
                    ...res.data,
                    name: `${res.data.name} (Copy)`
                });
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load campaign");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchCampaign();
        }
    }, [params.id]);

    if (loading) return <div className="p-8">Loading campaign...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Duplicate Campaign</h2>
                <p className="text-sm text-slate-500">Create a new campaign based on the settings of an existing one.</p>
            </div>
            <CampaignForm initialData={initialData} isEdit={false} />
        </div>
    );
}
