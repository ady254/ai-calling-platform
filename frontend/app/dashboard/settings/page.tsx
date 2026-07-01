"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBusiness, updateBusiness } from "@/services/business-service";
import { Business } from "@/types/business";

const LANGUAGE_OPTIONS = [
    { value: "en", label: "English" },
    { value: "ar", label: "Arabic" },
];

export default function SettingsPage() {
    const [business, setBusiness] = useState<Business | null>(null);
    const [form, setForm] = useState({ name: "", industry: "", default_language: "en" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await getBusiness();
                setBusiness(res.data);
                setForm({
                    name: res.data.name || "",
                    industry: res.data.industry || "",
                    default_language: res.data.default_language || "en",
                });
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load business settings");
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const res = await updateBusiness(form);
            setBusiness(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 text-sm">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl">
            <header className="mb-10">
                <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-slate-500 mt-2">Manage your business profile.</p>
            </header>

            <Card hoverable={false} className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">Business Profile</h2>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Business Name</label>
                        <input
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Al Noor Clinic"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Industry</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Healthcare"
                            value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Default Language</label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={form.default_language}
                            onChange={(e) => setForm({ ...form, default_language: e.target.value })}
                        >
                            {LANGUAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2 flex items-center gap-4">
                        <Button type="submit" disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        {saved && (
                            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                Saved
                            </span>
                        )}
                    </div>
                </form>
            </Card>
        </div>
    );
}
