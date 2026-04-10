"use client";

import Link from 'next/link';
import { ArrowRight, Phone, HeartPulse, Building, CircleDollarSign, ShoppingCart, Truck, Users, Scissors } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Navbar matching reference */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white font-bold text-xl leading-none">
                D
            </div>
            <span className="font-semibold text-xl tracking-tight">Dodo.</span>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-slate-600">
          <Link href="#platform" className="hover:text-black transition-colors">Creative Platform</Link>
          <Link href="#agents" className="hover:text-black transition-colors">Agents Platform</Link>
          <Link href="#developers" className="hover:text-black transition-colors">Developers</Link>
          <Link href="#resources" className="hover:text-black transition-colors">Resources</Link>
          <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[14px] font-medium text-slate-600 hover:text-black px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 transition-all bg-white shadow-sm">
            Log in
          </Link>
          <Link href="/signup" className="text-[14px] font-medium text-white px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 hover:opacity-90 transition-opacity shadow-sm">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 flex flex-col items-center text-center px-6">
        
        {/* The blocky/pixelated gradient background from reference simulated with large blurred shapes */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[90vw] h-[90vh] max-w-[1400px] -z-10 pointer-events-none opacity-50">
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#9b87f5] rounded-full mix-blend-multiply filter blur-[120px] animate-pulse-slow"></div>
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#7E69AB] rounded-full mix-blend-multiply filter blur-[140px] animate-float"></div>
            <div className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-[#33C3F0] rounded-full mix-blend-multiply filter blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-[#F2FCE2] rounded-full mix-blend-multiply filter blur-[120px] animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200/60 bg-white/50 backdrop-blur-md text-sm font-medium text-slate-800 mb-10 shadow-sm">
            <span className="font-semibold text-slate-600">Meet V-3</span> — The Future of AI Voice Agents
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[76px] font-medium tracking-tight mb-8 max-w-4xl text-slate-900 leading-[1.05]">
          AI Voice Agents That<br /> Handle Your Business Calls<br /> Seamlessly
        </h1>

        <p className="text-[17px] md:text-[22px] text-slate-600 mb-12 max-w-2xl font-light leading-relaxed">
          AI Voice Agents handle calls, qualify leads, book appointments, and support customers automatically. 24/7.
        </p>

        <Link href="/login" className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-full font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10">
          Talk to AI Agent
        </Link>
      </section>

      {/* Industries Section */}
      <section className="bg-white/80 backdrop-blur-3xl py-32 border-t border-slate-100/50 relative z-10 shadow-[0_-20px_40px_rgb(0,0,0,0.02)] rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-24">
                <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-slate-900">How Dodo helps businesses scale</h2>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light">
                    AI calling agents are essential for industries needing to handle high-volume, repetitive, or real-time customer communications efficiently. They offer 24/7 service, reduced wait times, and improved conversions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Real Estate */}
                <div className="bg-[#fafafa] rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Building className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">Real Estate</h3>
                    <p className="text-slate-600 font-light leading-relaxed text-[17px]">
                        Immediately responds to online lead queries, filters spam, and books viewings, crucial for minimizing missed opportunities.
                    </p>
                </div>

                {/* Healthcare */}
                <div className="bg-[#fafafa] rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <HeartPulse className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">Healthcare</h3>
                    <p className="text-slate-600 font-light leading-relaxed text-[17px]">
                        Automates appointment scheduling, reminders, insurance verification, and handles patient inquiries without taking breaks.
                    </p>
                </div>

                {/* BFSI */}
                <div className="bg-[#fafafa] rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <CircleDollarSign className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">BFSI</h3>
                    <p className="text-slate-600 font-light leading-relaxed text-[17px]">
                        Handles balance inquiries, verifies transactions, manages loan applications, and collects payments seamlessly.
                    </p>
                </div>

                {/* E-commerce */}
                <div className="bg-[#fafafa] rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">E-commerce</h3>
                    <p className="text-slate-600 font-light leading-relaxed text-[17px]">
                        Provides instant support for order status updates, returns, and personalized product recommendations.
                    </p>
                </div>

                {/* Logistics */}
                <div className="bg-[#fafafa] rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Truck className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">Logistics</h3>
                    <p className="text-slate-600 font-light leading-relaxed text-[17px]">
                        Manages booking confirmations, travel updates, and failed delivery inquiries with high context awareness.
                    </p>
                </div>

                {/* Recruitment */}
                <div className="bg-[#fafafa] rounded-3xl p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-900 tracking-tight">Recruitment & HR</h3>
                    <p className="text-slate-600 font-light leading-relaxed text-[17px]">
                        Screens candidates, schedules interviews, and answers basic FAQ for large talent pools instantly.
                    </p>
                </div>

                {/* Small Business - Span full width on md but normal on lg */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 lg:p-12 border border-indigo-100/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white shadow-md shadow-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                            <Scissors className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-semibold mb-3 text-slate-900 tracking-tight">Local Services & Small Business</h3>
                            <p className="text-slate-600 font-light leading-relaxed max-w-3xl text-lg">
                                Acts as a 24/7 virtual receptionist for salons, cleaners, and home services to book appointments and answer questions without losing a single lead.
                            </p>
                        </div>
                    </div>
                    <Link href="/signup" className="shrink-0 bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 transition-all hover:-translate-y-1">
                        Deploy your Agent
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* CTA / Footer Section */}
      <section className="bg-[#111] text-white py-32 px-6 relative overflow-hidden rounded-t-[3rem]">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-[#9b87f5] rounded-full mix-blend-screen filter blur-[140px]"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#33C3F0] rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-semibold mb-8 tracking-tight">Ready to transform your<br/>customer experience?</h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
                Join thousands of businesses delegating their voice communications to automated intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-full font-medium hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 text-center text-lg">
                    Get Started Free
                </Link>
                <Link href="/contact" className="w-full sm:w-auto bg-transparent text-white border border-white/20 px-10 py-5 rounded-full font-medium hover:bg-white/10 transition-all text-center text-lg">
                    Contact Us
                </Link>
            </div>

            <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white font-bold text-xs">D</div>
                    Dodo Calling
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
