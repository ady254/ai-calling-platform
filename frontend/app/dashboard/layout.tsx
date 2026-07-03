"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-black text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm">
              V3
            </div>
            <span className="font-semibold text-slate-800">V3.</span>
          </div>
        </div>
        <div className="p-4 sm:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}
