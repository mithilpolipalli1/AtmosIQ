import { useEffect, useState } from "react";
import { getCities, getStoredWeather, getStoredAirQuality } from "../api/api";
import { calculateIndianAQI, getAqiCategory } from "../utils/aqiCalc";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useApiCache } from "../utils/useApiCache";
import { FreshnessBadge, Shimmer } from "../components/LoadingSkeleton";

// ─── Component ──────────────────────────────────────────────────────────────
export default function MapView({ globalCity, setGlobalCity }) {
  const [cities, setCities] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

  useEffect(() => {
    getCities()
      .then((res) => {
        const raw = res.data.cities || res.data || [];
        const list = raw.map(c => typeof c === "string" ? c : c.name);
        setCities(list);
        if (!globalCity && list.length > 0) setGlobalCity(list[0]);
      })
      .catch(console.error);
  }, [globalCity, setGlobalCity]);

  const { data: cityDataResults, loading, isCached, lastUpdated } = useApiCache(
    cities.length > 0 ? "mapview_city_data" : null,
    async () => {
      const results = [];
      for (const city of cities) {
        try {
          const [wRes, aRes] = await Promise.all([
            getStoredWeather(city).catch(() => ({ data: null })),
            getStoredAirQuality(city).catch(() => ({ data: null })),
          ]);
          const weather = (wRes.data && !Array.isArray(wRes.data)) ? wRes.data : 
                         (Array.isArray(wRes.data) ? wRes.data[wRes.data.length - 1] : null);
          const aqi    = (aRes.data && !Array.isArray(aRes.data)) ? aRes.data : 
                         (Array.isArray(aRes.data) ? aRes.data[aRes.data.length - 1] : null);
          results.push({ city, weather, aqi });
        } catch {
          results.push({ city, weather: null, aqi: null });
        }
      }
      return results;
    },
    { enabled: cities.length > 0, refreshInterval: 15000 }
  );

  const cityData = cityDataResults || [];
  const selCard = cityData.find(c => c.city === globalCity) || null;
  const selAqiVal = selCard?.aqi ? calculateIndianAQI(selCard.aqi.components?.pm2_5) : "--";

  return (
    <div className="relative h-[calc(100vh)] -mt-6 -mx-6 bg-[#070913]">
      
      {/* ── BACKGROUND MAP ────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <MapContainer
          center={[22.5, 82.5]}
          zoom={4.5}
          zoomControl={false}
          className="w-full h-full bg-[#070913]"
        >
          <TileLayer
             url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {!loading && cityData.map((item, idx) => {
            if (!item.aqi || !item.aqi.lat) return null;
            return (
              <CircleMarker 
               key={idx} 
               center={[item.aqi.lat, item.aqi.lon]} 
               radius={item.city === globalCity ? 16 : 10} 
               eventHandlers={{
                  click: () => setGlobalCity(item.city),
               }}
               pathOptions={{ 
                   fillColor: item.city === globalCity ? "#6366f1" : "#10B981", 
                   color: "white", 
                   weight: 2, 
                   fillOpacity: 1 
               }}
              >
                 <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={item.city === globalCity}>
                    <div className="bg-[#0F1221] text-white p-2.5 rounded-xl border border-white/10 shadow-2xl">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{item.city}</p>
                        <p className="text-xs font-black mt-0.5">AQI {item.aqi ? calculateIndianAQI(item.aqi.components?.pm2_5) : '--'}</p>
                    </div>
                 </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* ── TOP LAYER: HEADER ─────────────────────────────────── */}
      <div className="absolute top-10 left-10 z-50 pointer-events-none drop-shadow-xl">
         <h1 className="text-4xl font-black tracking-tighter uppercase text-white leading-none">
           Air Quality <span className="text-slate-500 opacity-60">Index</span>
         </h1>
         <div className="mt-4 flex flex-col gap-2">
            <FreshnessBadge lastUpdated={lastUpdated} isCached={isCached} />
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] italic border-l-2 border-slate-700 pl-4 mt-1">
              Local ➔ {globalCity?.toUpperCase()}
            </p>
         </div>
      </div>

      {/* ── TOP LAYER: SATISFACTORY CARD (Center-Top) ─────────── */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="bg-[#1e253c]/95 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-2xl flex items-center gap-6 min-w-[300px]">
             {loading && cityData.length === 0 ? (
               <Shimmer className="w-14 h-14 rounded-2xl" />
             ) : (
               <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-black shadow-emerald-500/20 shadow-[0_0_20px] text-white">
                  {selAqiVal}
               </div>
             )}
             <div className="space-y-1.5 flex-1 w-full">
                {loading && cityData.length === 0 ? (
                  <>
                    <Shimmer className="h-4 w-2/3" />
                    <Shimmer className="h-3 w-1/3" />
                    <Shimmer className="h-3 w-full mt-2" />
                  </>
                ) : (
                  <>
                    <p className="text-white text-sm font-black uppercase tracking-tight leading-none">{selAqiVal !== "--" ? getAqiCategory(selAqiVal) : "Loading..."}</p>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest leading-none">In {globalCity}</p>
                    <div className="flex gap-4 pt-1 opacity-80">
                       <span className="text-[10px] font-bold text-slate-300 tracking-tight">🌡 {selCard?.weather?.temperature_c ?? "--"}°</span>
                       <span className="text-[10px] font-bold text-slate-300 tracking-tight">💧 {selCard?.weather?.humidity ?? "--"}%</span>
                       <span className="text-[10px] font-bold text-slate-300 tracking-tight">🌬 {selCard?.weather?.wind_speed ?? "--"} <span className="lowercase text-[8px]">km/h</span></span>
                    </div>
                  </>
                )}
             </div>
          </div>
      </div>

      {/* ── LEFT PANEL: MAIN STATISTICS ───────────────────────── */}
      <div className="absolute bottom-10 left-10 z-50 pointer-events-auto w-[320px]">
         <div className="bg-[#111629]/95 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-3xl space-y-8 group overflow-hidden transition-all duration-500">
            <div>
               <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-8 italic">Main Statistics</h2>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-60 mb-2">AQI</p>
               {loading && cityData.length === 0 ? (
                 <Shimmer className="h-16 w-24 mb-6" />
               ) : (
                 <div className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                    {selAqiVal}
                 </div>
               )}
               <div className="flex justify-between items-center mt-5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dominant Pollutant <span className="text-white ml-2">PM2.5 — Wind</span></p>
               </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-5">
               <div className="flex justify-between items-center bg-transparent">
                  <h3 className="text-xs font-black uppercase text-white tracking-widest leading-none">Risk of Pollution</h3>
                  <button 
                     onClick={() => setShowDetails(!showDetails)}
                     className={`text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all shadow-xl ${
                        showDetails 
                        ? 'bg-white text-black' 
                        : 'bg-[#fca311] text-black hover:bg-white'
                     }`}
                  >
                     {showDetails ? 'Close' : 'Details'}
                  </button>
               </div>
               <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="bg-[#fca311] h-full transition-all" style={{ width: `${Math.min(((selAqiVal === "--" ? 0 : selAqiVal) / 500) * 100, 100)}%` }}></div>
               </div>
            </div>

            {/* ── INTERACTIVE EXPANSION PANEL ── */}
            {showDetails && selCard?.aqi?.components && (
               <div className="pt-6 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-500">
                  <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4">Pollutant Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                     {Object.entries(selCard.aqi.components).map(([key, val]) => (
                        <div key={key} className="bg-white/3 hover:bg-white/8 transition-colors p-3 rounded-2xl flex flex-col justify-between border border-white/5">
                           <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                              {key.replace('_', '.')}
                           </span>
                           <span className="text-[13px] font-black text-white leading-none">
                              {Number(val).toFixed(key === 'co' ? 0 : 1)} <span className="text-[7px] text-slate-500 font-bold ml-0.5 tracking-tight">µg/m³</span>
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* ── RIGHT COORDS ────────────────────────────────────── */}
      <div className="absolute bottom-12 right-12 z-50 text-slate-700 font-bold tracking-widest text-[9px] text-right opacity-60">
         X : {selCard?.aqi?.lat?.toFixed(6) ?? "0.00"} <br />
         Y : {selCard?.aqi?.lon?.toFixed(6) ?? "0.00"}
      </div>

    </div>
  );
}
