"use client";

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text overflow-hidden">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-8 py-4 m-4">
        <div className="text-2xl font-extrabold gradient-text tracking-tighter">DODO.AI</div>
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">
          <a href="#features" className="hover:text-primary">Features</a>
          <a href="#pricing" className="hover:text-primary">Pricing</a>
          <a href="#about" className="hover:text-primary">About</a>
          <Link href="/login">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-32 flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary opacity-20 blur-[120px] rounded-full pointer-events-none -z-10 animate-float" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-secondary opacity-10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse" />
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
          Automate Your <br />
          <span className="gradient-text">Voice Engagement</span>
        </h1>
        <p className="text-xl md:text-2xl text-text-dim mb-10 max-w-2xl font-light">
          Experience India's first AI voice calling platform. Effortless scale, human-like conversations, and real-time analytics.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button size="lg">Start Free Trial ⚡</Button>
          <Button variant="outline" size="lg">Watch Demo</Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <Card className="hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-2xl">🎙️</div>
          <h3 className="text-xl font-bold mb-2">Human-Like Voice</h3>
          <p className="text-text-dim leading-relaxed">Advanced LLM integration for natural, fluid conversations that build trust.</p>
        </Card>
        <Card className="hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 text-2xl">📊</div>
          <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
          <p className="text-text-dim leading-relaxed">Track campaign performance, sentiment analysis, and conversion rates instantly.</p>
        </Card>
        <Card className="hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 text-2xl">🔄</div>
          <h3 className="text-xl font-bold mb-2">Seamless Integration</h3>
          <p className="text-text-dim leading-relaxed">Connect with your CRMs and existing workflows within minutes via our API.</p>
        </Card>
      </section>

      {/* Stats Counter */}
      <section className="bg-surface py-16 mt-12 border-y border-glass-border">
        <div className="max-w-6xl mx-auto px-8 flex flex-wrap justify-around gap-12 text-center">
          <div>
            <div className="text-5xl font-black gradient-text">1M+</div>
            <div className="text-sm font-bold uppercase tracking-widest text-text-dim mt-2">Calls Automated</div>
          </div>
          <div>
            <div className="text-5xl font-black gradient-text">99%</div>
            <div className="text-sm font-bold uppercase tracking-widest text-text-dim mt-2">Downtime-Free</div>
          </div>
          <div>
            <div className="text-5xl font-black gradient-text">24/7</div>
            <div className="text-sm font-bold uppercase tracking-widest text-text-dim mt-2">AI Support</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-glass-border mt-12 text-center text-text-dim">
        <div className="text-xl font-bold text-text mb-6">DODO by Innvox</div>
        <p className="mb-8">Empowering businesses with intelligent voice solutions.</p>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:text-primary">Twitter</a>
          <a href="#" className="hover:text-primary">LinkedIn</a>
          <a href="#" className="hover:text-primary">Documentation</a>
        </div>
        <div className="mt-12 text-xs opacity-50">© 2026 Innvox Innovations Pvt Ltd. All rights reserved.</div>
      </footer>
    </div>
  );
}
