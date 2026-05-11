import { useState, useEffect } from "react";
import { getAgents, createAgent, updateAgent, deleteAgent } from "../services/agent-service";
import { Agent, AgentCreate, AgentUpdate } from "../types/agent";

export const useAgents = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await getAgents();
            setAgents(res.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to fetch agents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const addAgent = async (data: AgentCreate) => {
        try {
            const res = await createAgent(data);
            setAgents((prev) => [res.data, ...prev]);
            return res.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.detail || "Failed to create agent");
        }
    };

    const editAgent = async (id: string, data: AgentUpdate) => {
        try {
            const res = await updateAgent(id, data);
            setAgents((prev) => prev.map((a) => (a.id === id ? res.data : a)));
            return res.data;
        } catch (err: any) {
            throw new Error(err.response?.data?.detail || "Failed to update agent");
        }
    };

    const removeAgent = async (id: string) => {
        try {
            await deleteAgent(id);
            setAgents((prev) => prev.filter((a) => a.id !== id));
        } catch (err: any) {
            throw new Error("Failed to delete agent");
        }
    };

    return { agents, loading, error, addAgent, editAgent, removeAgent, refresh: fetchAgents };
};
