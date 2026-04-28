"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PhoneCall,
  MessageSquare,
  Book,
  Cpu,
  FileText,
  GitMerge,
  Puzzle,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Call logs", href: "/dashboard/calls", icon: PhoneCall },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Knowledge Base", href: "/dashboard/knowledge-base", icon: Book },
  { name: "Integrations", href: "/dashboard/integrations", icon: Cpu },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Workflow Management", href: "/dashboard/workflows", icon: GitMerge },
  { name: "Agent Configuration", href: "/dashboard/agents", icon: Puzzle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-[#6366f1]/10 flex flex-col pt-6 font-sans">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 pb-8">
        <div className="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-2xl shadow-md border border-[#4f46e5]/20">
          V3
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-[#0f172a] text-lg leading-tight">V3.</span>
          <span className="text-xs text-[#6366f1]/60 font-medium tracking-wide">Customer Experience</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-in-out group relative overflow-hidden ${isActive
                ? "bg-[#6366f1]/10 text-[#6366f1] font-medium shadow-sm border border-[#6366f1]/10"
                : "text-[#334155] hover:bg-[#6366f1]/5 hover:text-[#6366f1]"
                }`}
            >
              {/* Active Indicator Line (Optional, adds a nice touch) */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#6366f1] rounded-r-full" />
              )}

              <Icon
                className={`w-[18px] h-[18px] stroke-[2px] transition-colors duration-300 ${isActive ? "text-[#6366f1]" : "text-[#94a3b8] group-hover:text-[#6366f1]"
                  }`}
              />
              <span className={`text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User / Bottom Section */}
      <div className="p-6 mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] rounded-2xl border border-slate-200/50 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
            A
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="text-sm font-semibold text-slate-700">Admin User</span>
            <span className="text-[10px] text-slate-400">admin@adnanahmad.ai</span>
          </div>
        </div>
      </div>
    </div>
  );
}
