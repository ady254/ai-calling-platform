"use client";

import React from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-[#1a1a1a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Huge blurred decorative shape like reference */}
      <div className="absolute top-[30%] left-[45%] w-[450px] h-[450px] bg-orange-500 opacity-80 blur-[130px] rounded-full pointer-events-none -z-10 animate-float" />
      
      <main className="w-full max-w-[500px] glass h-[800px] flex overflow-hidden shadow-2xl relative">
        {/* Left tall panel like reference Thu 24th card */}
        <section className="w-[60%] flex flex-col p-12 relative animate-pulse-slow">
          <div className="flex flex-col gap-2 mb-12">
             <div className="text-7xl font-light tracking-tighter leading-[0.9]">AI.</div>
             <div className="text-5xl font-light tracking-tighter opacity-40">24/7</div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 mt-12 text-sm leading-relaxed max-w-[200px]">
             <div className="opacity-80">
                <span className="font-bold block mb-1 uppercase tracking-widest text-[10px]">Active Node</span>
                Mumbai, India 
                <br />
                Cloud-East 102
             </div>
             <div className="opacity-40">
                Register to start your first campaign. 
                Experience the evolution.
             </div>
          </div>

          <div className="mt-auto flex flex-col gap-1 opacity-20">
             <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center">⚙️</div>
             <div className="text-[10px] font-bold uppercase tracking-widest">DODO.AI SYSTEM</div>
          </div>
        </section>

        {/* Right panel with actual form */}
        <section className="flex-1 bg-white/70 backdrop-blur-2xl p-12 flex flex-col relative">
           <header className="flex justify-end mb-16">
              <Link href="/login">
                <span className="text-xl font-medium opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  Login
                </span>
              </Link>
           </header>

           <div className="flex flex-col gap-2 mb-12">
              <h1 className="text-4xl font-medium leading-none">Register</h1>
              <p className="text-xs opacity-40">Join the future of voice.</p>
           </div>

           <form className="space-y-6 flex-1 flex flex-col">
              <div className="pill-input scale-90 -ml-4">
                 <span className="text-lg opacity-40">👤</span>
                 <input 
                    type="text" 
                    placeholder="full name" 
                    className="bg-transparent border-none outline-none flex-1 text-lg placeholder:text-black/30"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                 />
              </div>

              <div className="pill-input scale-90 -ml-4">
                 <span className="text-lg opacity-40">@</span>
                 <input 
                    type="email" 
                    placeholder="email address" 
                    className="bg-transparent border-none outline-none flex-1 text-lg placeholder:text-black/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
              </div>

              <div className="pill-input scale-90 -ml-4">
                 <span className="text-lg opacity-40">🔒</span>
                 <input 
                    type="password" 
                    placeholder="password" 
                    className="bg-transparent border-none outline-none flex-1 text-lg placeholder:text-black/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                 />
              </div>

              <div className="mt-auto relative z-20 self-end">
                 <button type="submit" className="action-pill scale-110">
                    <span>Join in</span>
                    <div className="arrow-circle">➔</div>
                 </button>
              </div>
           </form>
        </section>
      </main>

      {/* Decorative text on bottom right like original */}
      <div className="absolute bottom-12 left-12 text-sm opacity-20 hidden md:block">
         Grand opening <br />
         DODO AI Platform-v1.0
      </div>
    </div>
  );
}
