import React, { useEffect, useState } from "react";
import { getLatestAnomaly, getCities } from "../api/api";
import { Bike, ShieldAlert, Timer, ShieldCheck, Activity } from "lucide-react";

export default function DeliveryAdvisory({ globalCity, setGlobalCity }) {
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCities().then((res) => {
      const list = res.data.cities || res.data || [];
      const cleanList = list.map(c => typeof c === 'string' ? c : c.name);
      setCities(cleanList);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!globalCity) return;
    let cancelled = false;
    const controller = new AbortController();

    getLatestAnomaly(globalCity, { signal: controller.signal })
      .then(res => {
        if (!cancelled) {
          setAnomaly(res.data?.data || res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error(err);
          setAnomaly(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [globalCity]);

  // If no anomaly exists, show a standard fallback
  const advisory = anomaly?.delivery_advisory || {
    target_group: "Delivery workers",
    risk_level: "STANDARD",
    recommended_action: "Standard exposure risk. Monitor dashboard for sudden changes.",
    risk_window: "Conditions currently stable.",
    safe_window: "Optimal window for standard delivery operations."
  };

  const isHighRisk = ["CRITICAL", "HIGH"].includes(advisory.risk_level);
  const isMediumRisk = advisory.risk_level === "MEDIUM";
  
  const bgAccent = isHighRisk ? "bg-rose-500" : isMediumRisk ? "bg-amber-500" : "bg-emerald-500";
  const textAccent = isHighRisk ? "text-rose-500" : isMediumRisk ? "text-amber-500" : "text-emerald-500";
  const borderAccent = isHighRisk ? "border-rose-500/30" : isMediumRisk ? "border-amber-500/30" : "border-emerald-500/30";

  return (
    <div className="space-y-10 max-w-[1500px] mx-auto pb-40 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-white font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-4xl drop-shadow-[0_0_15px_rgba(var(--tw-colors-indigo-500),0.5)]`}><Bike className="w-10 h-10 text-indigo-400" /></span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white leading-none">
              Gig <span className="text-indigo-500">Advisory</span>
            </h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Targeted Exposure Intelligence for Delivery Networks</p>
        </div>

        <div className="flex gap-2 bg-[#0F1221] p-1.5 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto max-w-full">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setGlobalCity(city)}
              className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${
                globalCity === city 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 items-stretch">

        {/* ── LEFT TILE: CURRENT STATE ───────────────────── */}
        <div className={`lg:col-span-4 bg-[#0F1221] border ${borderAccent} rounded-[44px] shadow-2xl relative overflow-hidden group p-10 flex flex-col justify-between`}>
           <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2 ${bgAccent} opacity-10`} />
           
           <div>
              <div className="flex items-center gap-2 mb-8 bg-[#1A1F36] border border-white/5 w-fit px-4 py-2 rounded-full">
                 <div className={`w-2 h-2 rounded-full animate-pulse ${bgAccent}`} />
                 <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{advisory.target_group} Protocol</span>
              </div>
              
              <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] mb-3">Live Risk Level</h4>
              <div className="flex items-end gap-2 text-white">
                 <span className={`text-6xl font-black tracking-tighter leading-none ${textAccent} drop-shadow-md`}>{advisory.risk_level}</span>
              </div>
           </div>

           <div className="mt-12">
               <div className={`inline-flex items-center justify-center p-4 rounded-3xl border border-white/10 ${isHighRisk ? 'bg-rose-500/10' : isMediumRisk ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
                  {isHighRisk ? <ShieldAlert className={`w-10 h-10 ${textAccent}`} /> : <ShieldCheck className={`w-10 h-10 ${textAccent}`} />}
               </div>
           </div>
        </div>


        {/* ── MIDDLE TILE: THE ACTION PLAN ───────────────────── */}
        <div className={`lg:col-span-8 bg-[#0F1221] border ${borderAccent} rounded-[44px] shadow-2xl relative overflow-hidden group p-10 flex flex-col`}>
           <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
              <Activity className={`w-6 h-6 ${textAccent}`} />
              <h2 className="text-xl font-black uppercase text-white tracking-widest">Recommended Action Protocol</h2>
           </div>

           <div className="flex-1 flex flex-col justify-center">
              <p className="text-xl md:text-3xl font-bold text-slate-200 leading-relaxed mb-10">
                 {advisory.recommended_action}
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto border-t border-white/5 pt-8">
               <div className="flex gap-4">
                  <div className="shrink-0 p-3 bg-white/5 rounded-2xl h-fit border border-white/10">
                      <Timer className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Exposure Window</h5>
                      <p className="text-xs font-bold text-slate-300 leading-relaxed">{advisory.risk_window}</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="shrink-0 p-3 bg-white/5 rounded-2xl h-fit border border-emerald-500/20">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Safe Operation Window</h5>
                      <p className="text-xs font-bold text-slate-300 leading-relaxed">{advisory.safe_window}</p>
                  </div>
               </div>
           </div>
        </div>

      </div>

      {loading && (
        <div className="text-center pt-10">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4">Syncing Anomaly Engine</p>
        </div>
      )}
    </div>
  );
}
