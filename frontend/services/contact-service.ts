import { api } from "./api";
import { Contact, ContactCreate } from "@/types/contact";

export const getContacts = async () => {
    return api.get<Contact[]>("/contact");
};

export const getContact = async (id: string) => {
    return api.get<Contact>(`/contact/${id}`);
};

export const createContact = async (data: ContactCreate) => {
    return api.post<Contact>("/contact", data);
};

export const updateContact = async (id: string, data: Partial<ContactCreate>) => {
    return api.put<Contact>(`/contact/${id}`, data);
};

export const deleteContact = async (id: string) => {
    return api.delete(`/contact/${id}`);
};

export const importContacts = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/contact/import", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
