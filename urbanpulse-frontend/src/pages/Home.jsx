import React from 'react';

export default function Home({ onDiscover }) {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky nav height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white font-sans selection:bg-indigo-500/30">
      
      {/* ── STICKY TOP NAVIGATION ───────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-10 py-6 flex justify-between items-center backdrop-blur-md bg-brand-bg/80 border-b border-[#ffffff0a]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-blue-900/40">🌍</div>
          <span className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={() => window.scrollTo(0, 0)}>Atmos<span className="text-blue-500">IQ</span></span>
        </div>
        <div className="hidden md:flex items-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          <button onClick={() => scrollToSection('vision')} className="hover:text-blue-400 transition-colors">Our Vision</button>
          <button onClick={() => scrollToSection('aims')} className="hover:text-blue-400 transition-colors">Strategic Aims</button>
          <button onClick={() => scrollToSection('enterprise')} className="hover:text-blue-400 transition-colors">Enterprise</button>
        </div>
        <button 
          onClick={onDiscover}
          className="px-8 py-3 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all active:scale-95 shadow-2xl shadow-blue-700/50 border border-blue-400/20"
        >
          Discover Platform
        </button>
      </nav>

      {/* ── HERO SECTION ────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col items-center justify-center px-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-blue-600/10 blur-[200px] rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-600/5 blur-[180px] rounded-full"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl">
          <h1 className="text-8xl md:text-[10rem] font-bold tracking-tighter leading-none mb-6 drop-shadow-2xl">
            Atmos<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">IQ</span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-bold uppercase tracking-[0.6em] mb-12 opacity-80 leading-relaxed max-w-3xl mx-auto">
            Redefining <span className="text-white italic">Atmospheric Intelligence</span> For The Next Decade.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-slate-700 animate-pulse">
             <div className="h-px w-20 bg-current"></div>
             <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Scroll To Explore</span>
             <div className="h-px w-20 bg-current"></div>
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce opacity-30 cursor-pointer" onClick={() => scrollToSection('vision')}>
          <span className="text-4xl font-thin tracking-widest text-slate-100">↓</span>
        </div>
      </section>

      {/* ── VISION SECTION ─────────────────────────────────────────── */}
      <section id="vision" className="relative py-40 px-10 md:px-20 bg-brand-card">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          <div className="space-y-12">
            <div className="space-y-4">
              <span className="text-blue-500 text-xs font-bold uppercase tracking-[0.5em] italic">01 // The Vision</span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-none text-white italic">
                A Predictable <br /> Environment.
              </h2>
            </div>
            <p className="text-xl text-slate-400 font-bold leading-relaxed border-l-4 border-blue-600 pl-8 italic">
              "To lead the global transition toward transparent urban air quality management through real-time AI synchronization."
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                 <div className="text-3xl mb-3">🛡</div>
                 <h4 className="font-bold text-sm uppercase tracking-widest mb-2">Resilience</h4>
                 <p className="text-xs text-slate-500 font-bold">Hardening urban centers against rapid pollutant blooms.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                 <div className="text-3xl mb-3">💎</div>
                 <h4 className="font-bold text-sm uppercase tracking-widest mb-2">Purity</h4>
                 <p className="text-xs text-slate-500 font-bold">Standardizing clean air as an accessible human right.</p>
              </div>
            </div>
          </div>

          <div id="aims" className="space-y-12 bg-linear-to-br from-indigo-900/10 to-brand-bg border border-[#ffffff0a] p-12 md:p-16 rounded-[60px] shadow-2xl relative overflow-hidden group transition-all duration-700 hover:border-emerald-500/20">
            <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-blue-600/30 blur-[80px] group-hover:bg-blue-600/50 transition-colors"></div>
            
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-[0.5em] italic">02 // The Strategic Aim</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Engineered For <br /> <span className="text-emerald-400 italic">Global Impact.</span>
            </h2>
            <div className="space-y-10 pt-8">
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 rounded-full border border-emerald-500/50 flex items-center justify-center shrink-0 font-bold text-emerald-400">1</div>
                 <div>
                    <h5 className="font-bold text-lg text-white italic">AI Transparency</h5>
                    <p className="text-slate-500 text-sm font-bold mt-2 leading-relaxed">Closing the gap between raw environmental data and actionable community insights.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 rounded-full border border-blue-500/50 flex items-center justify-center shrink-0 font-bold text-blue-400">2</div>
                 <div>
                    <h5 className="font-bold text-lg text-white italic">Regional Integration</h5>
                    <p className="text-slate-500 text-sm font-bold mt-2 leading-relaxed">Unifying fragmented sensor networks into a single, cohesive intelligence stream.</p>
                 </div>
              </div>
              <div className="flex gap-6 items-start">
                 <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center shrink-0 font-bold text-white">3</div>
                 <div>
                    <h5 className="font-bold text-lg text-white italic">Predictive Safety</h5>
                    <p className="text-slate-500 text-sm font-bold mt-2 leading-relaxed">Forecasting hazardous anomalies before they reach critical population centers.</p>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA BOTTOM (ENTERPRISE / FINAL) ───────────────────────── */}
      <section id="enterprise" className="py-40 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-brand-card to-brand-bg"></div>
        <div className="relative z-10 space-y-10">
          <h3 className="text-4xl md:text-6xl font-bold italic tracking-tighter leading-none">Ready to Experience <br /> The Intelligence?</h3>
          <button 
            onClick={onDiscover}
            className="px-16 py-8 bg-white text-[#070913] rounded-3xl text-2xl font-bold uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all duration-500 hover:scale-110 active:scale-95 border-b-8 border-slate-300 hover:border-blue-800 shadow-2xl"
          >
            Launch System
          </button>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-20 border-t border-[#ffffff0a] flex flex-col items-center bg-brand-bg">
        <div className="flex gap-16 text-[11px] font-bold text-slate-600 uppercase tracking-[0.5em] mb-10 select-none">
          <span>ATMOSIQ // 2026</span>
          <span>•</span>
          <span>PRIVACY</span>
          <span>•</span>
          <span>REPORTS</span>
          <span>•</span>
          <span>CONTACT</span>
        </div>
        <p className="text-[10px] text-slate-800 font-bold uppercase tracking-[1em]">PROTECTING URBAN BREATH</p>
      </footer>

    </div>
  );
}
