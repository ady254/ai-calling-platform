import { useState, useEffect } from "react";
import { getContacts, createContact, deleteContact, importContacts } from "@/services/contact-service";
import { Contact, ContactCreate } from "@/types/contact";

export const useContacts = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await getContacts();
            setContacts(res.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to fetch contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const addContact = async (data: ContactCreate) => {
        try {
            const res = await createContact(data);
            setContacts((prev) => [res.data, ...prev]);
            return res.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.detail || "Failed to create contact");
        }
    };

    const removeContact = async (id: string) => {
        try {
            await deleteContact(id);
            setContacts((prev) => prev.filter((c) => c.id !== id));
        } catch (err: any) {
            throw new Error("Failed to delete contact");
        }
    };

    const uploadCsv = async (file: File) => {
        try {
            const res = await importContacts(file);
            await fetchContacts(); // Refresh list after import
            return res.data;
        } catch (err: any) {
             throw new Error(err.response?.data?.detail || "Failed to import contacts");
        }
    }

    return { contacts, loading, error, addContact, removeContact, uploadCsv, refresh: fetchContacts };
};
