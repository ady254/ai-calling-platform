"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Avoid flashing dashboard content before the redirect above resolves.
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
