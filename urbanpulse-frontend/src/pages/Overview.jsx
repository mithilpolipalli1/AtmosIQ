import { useEffect, useState } from "react";
import { getCities, getStoredWeather, getStoredAirQuality, getLatestAnomaly } from "../api/api";
import { calculateIndianAQI } from "../utils/aqiCalc";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useApiCache } from "../utils/useApiCache";
import { TableRowSkeleton, FreshnessBadge, Shimmer } from "../components/LoadingSkeleton";
import {
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Activity,
  BarChart3,
  Globe,
  AlertTriangle,
  Zap,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning
} from "lucide-react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars

// ── 3D Glassmorphic Weather Models ──
const render3DWeatherModel = (condition) => {
  const cond = condition?.toLowerCase() || "";
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;

  if (cond.includes("thunderstorm")) {
    return (
      <div className="relative w-full h-full flex items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
         <CloudLightning className="w-20 h-20 text-slate-300 fill-slate-800 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] absolute z-10" strokeWidth={1} />
         <Zap className="w-10 h-10 text-amber-400 fill-amber-300 absolute mt-10 ml-4 z-20 drop-shadow-[0_0_20px_rgba(251,191,36,1)] animate-pulse" />
      </div>
    );
  }
  
  if (cond.includes("clear") && !isNight) {
     return (
      <div className="relative w-full h-full flex items-center justify-center">
         <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full animate-pulse" />
         <div className="relative animate-[spin_12s_linear_infinite]">
            <Sun className="w-20 h-20 text-amber-300 fill-amber-500 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]" strokeWidth={1.5} />
         </div>
         <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent rounded-full mix-blend-overlay"></div>
      </div>
     )
  }

  if (cond.includes("clear") && isNight) {
     return (
      <div className="relative w-full h-full flex items-center justify-center animate-[bounce_4s_ease-in-out_infinite]">
         <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
         <div className="relative transform -rotate-12">
            <Moon className="w-16 h-16 text-indigo-200 fill-indigo-900 drop-shadow-[0_0_30px_rgba(199,210,254,0.6)]" strokeWidth={1.5} />
         </div>
      </div>
     )
  }

  if (cond.includes("rain") || cond.includes("drizzle")) {
     return (
      <div className="relative w-full h-full flex items-center justify-center">
         <CloudRain className="w-20 h-20 text-slate-300 fill-slate-800 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] absolute z-10 animate-[bounce_3s_ease-in-out_infinite]" strokeWidth={1} />
         <Droplets className="w-8 h-8 text-blue-400 fill-blue-500 absolute mt-14 z-20 drop-shadow-[0_0_15px_rgba(59,130,246,0.9)] animate-pulse" />
      </div>
     )
  }

  // Clouds / Mist / Haze / Default
  return (
      <div className="relative w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
         <div className="absolute inset-0 bg-slate-400/10 blur-2xl rounded-full" />
         <Cloud className="w-24 h-24 text-white fill-slate-200 opacity-90 drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)] absolute z-20 animate-[bounce_4s_ease-in-out_infinite]" strokeWidth={0.5} />
         
         {isNight ? (
            <Moon className="w-10 h-10 text-indigo-300 fill-indigo-800 absolute -mt-8 ml-10 z-10 drop-shadow-[0_0_15px_rgba(199,210,254,0.4)] transform rotate-12" strokeWidth={1} />
         ) : (
            <div className="absolute -mt-8 ml-12 z-10 animate-[spin_10s_linear_infinite]">
                 <Sun className="w-12 h-12 text-amber-400 fill-amber-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]" strokeWidth={1} />
            </div>
         )}
      </div>
  )
};

const getWeatherBadgeStyle = (condition) => {
  const cond = condition?.toLowerCase() || "";
  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;

  if (cond.includes("thunderstorm")) return "bg-linear-to-br from-indigo-500 via-purple-600 to-indigo-900 border-indigo-400";
  if (cond.includes("clear")) return isNight 
         ? "bg-linear-to-br from-slate-800 via-indigo-950 to-black border-indigo-900/50" 
         : "bg-linear-to-br from-amber-200 via-orange-400 to-amber-600 border-orange-300";
  if (cond.includes("clouds") || cond.includes("overcast")) return "bg-linear-to-br from-slate-100 via-slate-300 to-slate-400 border-slate-300";
  if (cond.includes("rain") || cond.includes("drizzle")) return "bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600 border-blue-400";
  if (cond.includes("mist") || cond.includes("haze")) return "bg-linear-to-br from-gray-200 via-gray-300 to-gray-400 border-gray-300";
  
  return isNight 
         ? "bg-linear-to-br from-slate-800 via-indigo-950 to-black border-indigo-900/50"
         : "bg-linear-to-br from-sky-200 via-blue-400 to-blue-500 border-blue-300";
};

const fallbackCities = ["Hyderabad", "Delhi", "Mumbai", "Kolkata", "Bengaluru", "Chennai"];

export default function Overview({ globalCity, setGlobalCity }) {
  const [cities, setCities] = useState([]);
  const [apiStatus, setApiStatus] = useState("connecting");

  useEffect(() => {
    let retries = 0;
    const fetch = () => {
        getCities().then((res) => {
          const raw = res.data.cities || (Array.isArray(res.data) ? res.data : []);
          const list = raw.map(c => typeof c === 'string' ? c : c.name);
          if (list.length > 0) {
            setCities(list);
            setApiStatus("online");
          } else {
             // If API returns empty, use fallbacks
             setCities(fallbackCities);
             setApiStatus("offline (static)");
          }
          if (!globalCity && list.length > 0) setGlobalCity(list[0]);
          else if (!globalCity) setGlobalCity(fallbackCities[0]);
        }).catch(err => {
            console.error("API Error:", err);
            if (retries < 3) {
                retries++;
                setTimeout(fetch, 2000);
            } else {
                setCities(fallbackCities);
                setGlobalCity(fallbackCities[0]);
                setApiStatus("offline (static)");
            }
        });
    };
    fetch();
  }, [globalCity, setGlobalCity]);

  const { data: cityDataResults, loading: loadingCityData, isCached: isCityDataCached, lastUpdated: cityDataUpdate } = useApiCache(
    cities.length ? "overview_city_data" : null,
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

  const { data: latestAnomalyData, loading: loadingAnomaly } = useApiCache(
    globalCity ? `anomaly_${globalCity}` : null,
    async () => {
      const res = await getLatestAnomaly(globalCity);
      return res.data?.data || res.data;
    },
    { enabled: !!globalCity, refreshInterval: 15000 }
  );
  
  const latestAnomaly = latestAnomalyData || null;

  const selCard = cityData.find(c => c.city === globalCity) || null;
  const selAqiVal = selCard?.aqi ? calculateIndianAQI(selCard.aqi.components?.pm2_5) : "--";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 max-w-[1500px] mx-auto pb-40 text-white font-sans">

      {/* ── TOP: CITY TABLE ───────────────────────── */}
      <motion.div variants={itemAnim} className="px-4">
        <div className="glass-panel glass-panel-hover rounded-[44px] p-8 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none animate-blob" />
          <div className="absolute top-6 right-8">
            <FreshnessBadge lastUpdated={cityDataUpdate} isCached={isCityDataCached} />
          </div>
          <table className="w-full text-left">
            <thead className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/5">
              <tr>
                <th className="pb-8 uppercase">City</th>
                <th className="pb-8 text-center uppercase">Temperature</th>
                <th className="pb-8 text-center uppercase">Humidity</th>
                <th className="pb-8 text-center uppercase">AQI</th>
                <th className="pb-8 text-center uppercase">Wind Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingCityData ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : cityData.map((item, i) => {
                const aVal = item.aqi ? calculateIndianAQI(item.aqi.components?.pm2_5) : "--";
                const isSelected = item.city === globalCity;
                return (
                  <tr
                    key={i}
                    className={`group hover:bg-white/2 transition-all cursor-pointer ${isSelected ? 'bg-indigo-500/5' : ''}`}
                    onClick={() => setGlobalCity(item.city)}
                  >
                    <td className="py-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-6 rounded-full transition-all ${isSelected ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-indigo-500/30'}`} />
                            <span className="font-black text-xs text-slate-300 uppercase tracking-widest group-hover:text-white transition-all">{item.city}</span>
                        </div>
                    </td>
                    <td className="py-6 text-center font-bold text-xs text-slate-400 group-hover:text-white transition-colors">{item.weather?.temperature_c != null ? `${item.weather.temperature_c.toFixed(1)}°C` : "--"}</td>
                    <td className="py-6 text-center font-bold text-xs text-slate-400 group-hover:text-white transition-colors">{item.weather?.humidity != null ? `${item.weather.humidity}%` : "--"}</td>
                    <td className="py-6 text-center">
                      <span className={`text-[10px] font-black  px-8 py-2 rounded-xl transition-all duration-500 ${aVal !== "--" && aVal > 200 ? 'text-rose-500 bg-rose-500/10 border border-rose-500/20' : aVal !== "--" ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-500 bg-slate-500/10 border border-slate-500/20'}`}>
                        {aVal}
                      </span>
                    </td>
                    <td className="py-6 text-center font-bold text-xs text-slate-400 group-hover:text-white transition-colors">{item.weather?.wind_speed != null ? `${item.weather.wind_speed.toFixed(1)} km/h` : "--"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 px-4 items-stretch">

        {/* ── LEFT: ANALYTICS CARDS ────────────── */}
        <div className="xl:col-span-3 space-y-6 flex flex-col h-full z-10">
           {/* Card 1 */}
           <motion.div variants={itemAnim} className="glass-panel glass-panel-hover rounded-3xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-slate-500 mb-3 relative z-10">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                AVERAGE AQI
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                   {cityData.length > 0 ? Math.round(cityData.reduce((acc, curr) => acc + (curr.aqi ? calculateIndianAQI(curr.aqi.components?.pm2_5) : 0), 0) / cityData.filter(c => c.aqi).length) || 50 : 50}
                 </span>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">(GOOD)</span>
              </div>
           </motion.div>

           {/* Card 2 */}
           <motion.div variants={itemAnim} className="glass-panel glass-panel-hover border-l-4 border-l-rose-500 rounded-3xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 blur-[50px] pointer-events-none" />
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-slate-500 mb-3 relative z-10">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                ACTIVE ALERTS
              </div>
              <div className="space-y-2">
                 {loadingAnomaly ? (
                    <>
                       <Shimmer className="h-6 w-3/4 mb-2" />
                       <Shimmer className="h-4 w-full" />
                    </>
                 ) : latestAnomaly ? (
                    <>
                       <div className="text-xl font-black text-rose-500 leading-none tracking-tight uppercase">
                           1 HIGH PRIORITY
                       </div>
                       <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2 pr-2">
                           {latestAnomaly.insight || "ANOMALY DETECTED..."}
                       </div>
                    </>
                 ) : (
                    <>
                       <div className="text-xl font-black text-emerald-500 leading-none tracking-tight uppercase">
                           NO ALERTS
                       </div>
                       <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed pr-2">
                           ALL METRICS ARE NORMAL
                       </div>
                    </>
                 )}
              </div>
           </motion.div>

           {/* Card 3 */}
           <motion.div variants={itemAnim} className="glass-panel glass-panel-hover rounded-3xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none" />
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-slate-500 mb-3 relative z-10">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                DATA POINTS
              </div>
              <div className="flex items-baseline">
                 <span className="text-4xl font-black text-white tracking-tighter drop-shadow-md">1.2M</span>
              </div>
           </motion.div>
        </div>

        {/* ── CENTER: MAP ─────────────────── */}
        <motion.div variants={itemAnim} className="xl:col-span-5 glass-panel glass-panel-hover rounded-[40px] relative overflow-hidden group min-h-[400px] lg:min-h-[500px] z-10">
            <div className="absolute top-6 left-6 z-30 pointer-events-none drop-shadow-xl">
               <h3 className="text-xl font-black tracking-tighter uppercase text-white leading-none mb-1">AQI OVERVIEW</h3>
               <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">{apiStatus.toUpperCase()}</p>
               </div>
           </div>

           <div className="w-full h-full absolute inset-0 z-0 bg-transparent">
             <MapContainer center={[20, 78]} zoom={4.5} className="w-full h-full" zoomControl={false}>
               <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
               {cityData.map((item, idx) => (
                 item.aqi?.lat && (
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
                 )
               ))}
             </MapContainer>
           </div>

           {/* Floating City Card */}
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5, type: "spring" }}
             className="absolute bottom-6 left-6 z-40 bg-brand-bg border border-[#ffffff15] rounded-3xl p-6 min-w-[180px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl"
           >
              <div className="flex items-center gap-2 mb-2">
                 <Globe className="w-3.5 h-3.5 text-indigo-500" />
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{globalCity}</p>
              </div>
              <p className="text-3xl font-black text-white tracking-tighter mb-3 leading-none">AQI {selAqiVal}</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${selAqiVal > 200 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((selAqiVal / 500) * 100, 100)}%` }}></div>
              </div>
           </motion.div>
        </motion.div>

        {/* ── RIGHT: WEATHER CARD ──────────── */}
        <motion.div variants={itemAnim} className="xl:col-span-4 glass-panel glass-panel-hover rounded-[40px] relative overflow-hidden group p-8 flex flex-col justify-between z-10">
           
           <div className="relative z-10 flex justify-between items-start w-full">
              <div className="flex items-center gap-2 bg-[#1A1F36] rounded-full px-4 py-2 shadow-sm border border-white/5 h-fit mt-2">
                 <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                 <h2 className="text-[9px] font-black uppercase text-white tracking-widest">{globalCity}, INDIA</h2>
              </div>
              <div className={`w-32 h-32 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-center relative border-t-2 border-l-2 border-white/20 transform hover:-translate-y-2 transition-all duration-500 overflow-hidden backdrop-blur-2xl bg-white/5 ${getWeatherBadgeStyle(selCard?.weather?.weather)}`}>
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent rounded-b-[2.5rem]"></div>
                 <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/30 to-transparent rounded-t-[2.5rem]"></div>
                 {/* The 3D Rendered Object */}
                 {render3DWeatherModel(selCard?.weather?.weather)}
              </div>
           </div>

           <div className="relative z-10 w-full flex flex-col items-start mt-2 pb-2">
              <div className="flex items-end tracking-tighter drop-shadow-xl">
                 <span className="text-6xl font-black text-white leading-none">
                     {selCard?.weather?.temperature_c != null ? Number(selCard.weather.temperature_c).toFixed(1) : "--"}
                 </span>
                 <span className="text-2xl font-black text-indigo-500 ml-1 mb-1 leading-none">°C</span>
              </div>
              <h4 className="text-xl font-black text-slate-300 mt-2 uppercase tracking-widest opacity-90">
                {selCard?.weather?.weather || "---"}
              </h4>
           </div>

           <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full mt-4">
              <div className="bg-[#171A2E] rounded-2xl px-5 py-4 flex items-center gap-4 flex-1 border border-white/5 shadow-sm">
                 <Droplets className="w-5 h-5 text-indigo-500/80" strokeWidth={2.5} />
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 tracking-widest mb-1 uppercase">HUMIDITY</span>
                    <span className="text-lg font-black text-white leading-none">{selCard?.weather?.humidity != null ? `${selCard.weather.humidity}%` : "--"}</span>
                 </div>
              </div>
              <div className="bg-[#171A2E] rounded-2xl px-5 py-4 flex items-center gap-4 flex-1 border border-white/5 shadow-sm">
                 <Wind className="w-5 h-5 text-indigo-500/80" strokeWidth={2.5} />
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 tracking-widest mb-1 uppercase">WIND</span>
                    <span className="text-lg font-black text-white leading-none inline-flex items-baseline gap-1">
                        {selCard?.weather?.wind_speed != null ? selCard.weather.wind_speed : "--"}
                        <span className="text-[9px] font-bold text-slate-500 lowercase">km/h</span>
                    </span>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}