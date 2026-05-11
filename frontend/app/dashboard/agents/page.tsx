import AgentConfigurationClient from "./agent-client";

export const metadata = {
    title: "Agent Configuration | V3 AI",
    description: "Design and manage your AI agent personas.",
};

export default function AgentConfigurationPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <AgentConfigurationClient />
        </div>
    );
}
