"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCampaign } from "@/services/campaign-service";
import CampaignForm from "@/components/forms/campaign-form";

export default function EditCampaignPage() {
    const params = useParams();
    const router = useRouter();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await getCampaign(params.id as string);
                setInitialData(res.data);
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
            <CampaignForm initialData={initialData} isEdit={true} campaignId={params.id as string} />
        </div>
    );
}
