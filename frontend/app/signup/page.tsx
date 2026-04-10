"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Activity } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login.");
        router.push("/login");
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorations matching landing page */}
      <div className="absolute top-[20%] right-1/2 translate-x-1/2 w-[90vw] h-[90vh] -z-10 pointer-events-none opacity-40">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#9b87f5] rounded-full filter blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#33C3F0] rounded-full filter blur-[140px] animate-float"></div>
      </div>
      
      <main className="w-full max-w-[900px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[650px]">
        {/* Left panel - Branding & Info */}
        <section className="w-full md:w-[45%] bg-[#f8fafc] p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
           <div>
              <div className="flex items-center gap-2 mb-12">
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold text-2xl leading-none">
                      D
                  </div>
                  <span className="font-bold text-2xl tracking-tighter">Dodo.</span>
              </div>

              <div className="space-y-6">
                  <h2 className="text-6xl font-black text-slate-200 tracking-tighter leading-none select-none">
                      JOIN.
                  </h2>
                  <div className="space-y-4 max-w-[280px]">
                      <p className="text-slate-500 font-medium uppercase tracking-widest text-[11px]">Empower your business</p>
                      <p className="text-slate-600 text-[15px] leading-relaxed">
                          Create your account to start deploying your first AI voice agent.
                      </p>
                      <p className="text-slate-400 text-sm font-light">
                          Experience the evolution of automated communication.
                      </p>
                  </div>
              </div>
           </div>

           <div className="flex items-center gap-3 text-slate-300">
              <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Node: Mumbai 102</span>
           </div>
        </section>

        {/* Right panel - Form */}
        <section className="flex-1 p-12 flex flex-col justify-center relative bg-white">
           <div className="absolute top-10 right-12">
              <Link href="/login" className="text-slate-400 text-sm font-medium hover:text-indigo-600 transition-colors">
                Already have an account? <span className="text-indigo-600 font-bold ml-1">Log in</span>
              </Link>
           </div>

           <div className="mb-10">
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2">Register</h1>
              <p className="text-slate-400 text-[15px]">Join the future of voice engagement today.</p>
           </div>

           <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="flex items-center gap-4 px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all group">
                     <User className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                        type="text" 
                        placeholder="John Doe" 
                        className="bg-transparent border-none outline-none flex-1 text-[15px] placeholder:text-slate-300 w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                     />
                  </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="flex items-center gap-4 px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all group">
                     <Mail className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                        type="email" 
                        placeholder="your@email.com" 
                        className="bg-transparent border-none outline-none flex-1 text-[15px] placeholder:text-slate-300 w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>
              </div>

              <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="flex items-center gap-4 px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all group">
                     <Lock className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                     <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-transparent border-none outline-none flex-1 text-[15px] placeholder:text-slate-300 w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                  </div>
              </div>

              <div className="pt-6">
                 <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full flex items-center justify-between px-8 py-4 bg-[#111] text-white rounded-full font-bold shadow-xl shadow-black/10 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                 >
                    <span>{loading ? "Joining..." : "Create Account"}</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                 </button>
              </div>
           </form>
        </section>
      </main>
    </div>
  );
}


