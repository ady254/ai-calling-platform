"use client";

import { useState } from "react";
import { useContacts } from "@/hooks/useContact";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Search, Trash2, Phone, Mail } from "lucide-react";

export default function ContactsPageClient() {
    const { contacts, loading, error, removeContact, uploadCsv } = useContacts();
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    if (loading) return <div className="p-8">Loading contacts...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone_number.includes(searchTerm)
    );

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadCsv(file);
            alert("Contacts imported successfully!");
        } catch (err: any) {
            alert(`Import failed: ${err.message}`);
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className="w-full">
            <header className="mb-10 w-full flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-semibold text-slate-800 tracking-tight">Contacts</h1>
                    <p className="text-slate-500 mt-2">Manage your contact lists for AI campaigns.</p>
                </div>
                <div className="flex gap-3">
                    <label className="cursor-pointer">
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        <div className={`inline-flex items-center justify-center rounded-full font-medium transition-all px-6 py-3 text-sm border-2 border-black/10 hover:border-black/20 text-black gap-2 ${isUploading ? 'opacity-50' : ''}`}>
                            <Upload className="w-4 h-4" />
                            {isUploading ? "Importing..." : "Import CSV"}
                        </div>
                    </label>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Contact
                    </Button>
                </div>
            </header>

            <Card className="p-6 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Search contacts by name or phone..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company/Tags</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredContacts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                    No contacts found.
                                </td>
                            </tr>
                        ) : (
                            filteredContacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{contact.name}</div>
                                        <div className="text-xs text-slate-400 mt-1">Added {new Date(contact.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {contact.phone_number}
                                        </div>
                                        {contact.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Mail className="w-3.5 h-3.5" />
                                                {contact.email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700">{contact.company || "-"}</div>
                                        {contact.tags && (
                                            <div className="flex gap-1 mt-1">
                                                {contact.tags.split(',').map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                                            {contact.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                if(confirm("Delete this contact?")) removeContact(contact.id);
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
