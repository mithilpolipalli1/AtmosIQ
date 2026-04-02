import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  TrendingUp, 
  Map as MapIcon, 
  Brain, 
  Globe,
  Bike
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { name: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Anomalies", icon: <AlertCircle className="w-5 h-5" /> },
    { name: "Trends", icon: <TrendingUp className="w-5 h-5" /> },
    { name: "Map", icon: <MapIcon className="w-5 h-5" /> },
    { name: "AI Insights", icon: <Brain className="w-5 h-5" /> },
    { name: "Delivery API", icon: <Bike className="w-5 h-5" /> },
  ];

  return (
    <div className="w-[300px] bg-brand-card border-r border-[#ffffff0a] min-h-screen flex flex-col shrink-0 px-8 py-12 text-white shadow-2xl relative overflow-hidden z-20">
      {/* Decorative Glow */}
      <div className="absolute top-0 -left-20 w-40 h-40 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none animate-pulse-slow" />
      
      {/* Brand Header */}
      <div 
        className="flex items-center gap-4 px-2 mb-16 group cursor-pointer relative z-10" 
        onClick={() => setActiveTab("Home")}
      >
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-all duration-500">
          <Globe className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-white leading-none">AtmosIQ</h1>
          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1.5 opacity-80">Metropolitan AI</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-3 relative z-10">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-5 px-6 py-4.5 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] relative overflow-hidden group ${
                  isActive
                    ? "text-white bg-white/5 shadow-xl border border-white/10"
                    : "text-slate-500 hover:text-white hover:bg-white/3"
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-r-full" />
              )}
              <div className={`transition-all duration-500 ${isActive ? 'text-indigo-400 scale-110' : 'group-hover:text-slate-300'}`}>
                {item.icon}
              </div>
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Version Flag */}
      <div className="mt-auto pt-8 border-t border-white/5 relative z-10">
        <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-400">Network Status</p>
            <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">v4.2.0 Stable</p>
            </div>
        </div>
      </div>
    </div>
  );
}