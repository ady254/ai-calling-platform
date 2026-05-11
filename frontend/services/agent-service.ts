import { api } from "./api";
import { Agent, AgentCreate, AgentUpdate } from "../types/agent";

export const getAgents = () => api.get<Agent[]>("/agent/");

export const getAgent = (id: string) => api.get<Agent>(`/agent/${id}`);

export const createAgent = (data: AgentCreate) => api.post<Agent>("/agent/", data);

export const updateAgent = (id: string, data: AgentUpdate) => api.put<Agent>(`/agent/${id}`, data);

export const deleteAgent = (id: string) => api.delete(`/agent/${id}`);
