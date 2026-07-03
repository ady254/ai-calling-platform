import "./globals.css";
import React from "react";
import { Toaster } from "sonner";

export const metadata = {
    title: "V3 — AI Voice Agents for Business Calls",
    description: "AI voice agents that handle calls, qualify leads, book appointments, and support customers automatically. 24/7.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster position="top-right" richColors closeButton />
            </body>
        </html>
    );
}
