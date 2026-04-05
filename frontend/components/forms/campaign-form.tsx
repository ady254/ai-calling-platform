"use client";

import { useState } from "react";
import { scenarios } from "@/utils/scenarios";
import { useCampaign } from "@/hooks/useCampaign";

export default function CampaignForm() {
    const [business, setBusiness] = useState<keyof typeof scenarios>("healthcare");
    const [scenario, setScenario] = useState("");
    const [contacts, setContacts] = useState("");

    const { create } = useCampaign();

    const handleSubmit = async () => {
        const contactList = contacts.split(",");

        await create({
            businessType: business,
            scenario,
            contacts: contactList,
        });

        alert("Campaign Created 🚀");
    };

    return (
        <div className="p-4 space-y-4">

            <h2>Create Campaign</h2>

            {/* Business Type */}
            <select
                value={business}
                onChange={(e) => setBusiness(e.target.value as keyof typeof scenarios)}
            >
                <option value="healthcare">Healthcare</option>
                <option value="gym">Gym</option>
                <option value="real_estate">Real Estate</option>
                <option value="education">Education</option>
            </select>

            {/* Scenario */}
            <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
            >
                <option>Select Scenario</option>
                {scenarios[business]?.map((s) => (
                    <option key={s}>{s}</option>
                ))}
            </select>

            {/* Contacts */}
            <textarea
                placeholder="Enter phone numbers comma separated"
                onChange={(e) => setContacts(e.target.value)}
            />

            {/* Submit */}
            <button onClick={handleSubmit}>
                Launch Campaign
            </button>

        </div>
    );
}