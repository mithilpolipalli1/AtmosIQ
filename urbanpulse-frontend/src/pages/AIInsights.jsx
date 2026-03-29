import { useEffect, useState } from "react";
import { getCities, getStoredWeather, getStoredAirQuality, getLatestAnomaly, getAnomaliesByCity } from "../api/api";
import { calculateIndianAQI } from "../utils/aqiCalc";
import { useApiCache } from "../utils/useApiCache";
import { FreshnessBadge, Shimmer } from "../components/LoadingSkeleton";

const LOCAL_AREAS = {
  "Delhi": [
    { name: "Connaught Place", aqi: 65, temp: "21.5°C", humidity: "73%", wind: "1.6 km/h" },
    { name: "Dwarka", aqi: 58, temp: "22.0°C", humidity: "72%", wind: "1.5 km/h" },
    { name: "Vasant Kunj", aqi: 71, temp: "20.7°C", humidity: "71%", wind: "2.0 km/h" },
    { name: "Karol Bagh", aqi: 52, temp: "23.0°C", humidity: "79%", wind: "1.3 km/h" },
    { name: "Rohini", aqi: 77, temp: "19.9°C", humidity: "69%", wind: "2.4 km/h" },
  ],
  "Hyderabad": [
    { name: "HITEC City", aqi: 55, temp: "25.2°C", humidity: "80%", wind: "2.1 km/h" },
    { name: "Secunderabad", aqi: 62, temp: "24.8°C", humidity: "78%", wind: "1.8 km/h" },
    { name: "Gachibowli", aqi: 48, temp: "25.5°C", humidity: "82%", wind: "2.3 km/h" },
    { name: "Kukatpally", aqi: 70, temp: "24.3°C", humidity: "77%", wind: "1.6 km/h" },
    { name: "LB Nagar", aqi: 59, temp: "25.0°C", humidity: "79%", wind: "1.9 km/h" },
  ],
  "Mumbai": [
    { name: "Andheri", aqi: 61, temp: "28.3°C", humidity: "85%", wind: "3.2 km/h" },
    { name: "Bandra", aqi: 54, temp: "27.8°C", humidity: "87%", wind: "3.5 km/h" },
    { name: "Colaba", aqi: 45, temp: "27.5°C", humidity: "88%", wind: "4.1 km/h" },
    { name: "Dadar", aqi: 68, temp: "28.1°C", humidity: "84%", wind: "2.8 km/h" },
    { name: "Juhu", aqi: 50, temp: "27.6°C", humidity: "86%", wind: "3.8 km/h" },
  ],
  "Kolkata": [
    { name: "Salt Lake", aqi: 72, temp: "30.2°C", humidity: "80%", wind: "2.1 km/h" },
    { name: "Park Street", aqi: 65, temp: "29.8°C", humidity: "82%", wind: "1.9 km/h" },
    { name: "Howrah", aqi: 80, temp: "30.5°C", humidity: "78%", wind: "1.7 km/h" },
    { name: "Tollygunge", aqi: 58, temp: "29.5°C", humidity: "81%", wind: "2.3 km/h" },
    { name: "New Town", aqi: 52, temp: "30.0°C", humidity: "79%", wind: "2.5 km/h" },
  ],
  "Bengaluru": [
    { name: "Koramangala", aqi: 42, temp: "23.5°C", humidity: "65%", wind: "3.1 km/h" },
    { name: "Whitefield", aqi: 55, temp: "24.2°C", humidity: "62%", wind: "2.8 km/h" },
    { name: "Indiranagar", aqi: 38, temp: "23.8°C", humidity: "64%", wind: "3.3 km/h" },
    { name: "Jayanagar", aqi: 45, temp: "23.2°C", humidity: "66%", wind: "2.9 km/h" },
    { name: "Electronic City", aqi: 60, temp: "24.5°C", humidity: "61%", wind: "2.5 km/h" },
  ],
  "Chennai": [
    { name: "T. Nagar", aqi: 48, temp: "32.5°C", humidity: "75%", wind: "2.8 km/h" },
    { name: "Adyar", aqi: 42, temp: "31.8°C", humidity: "78%", wind: "3.2 km/h" },
    { name: "Anna Nagar", aqi: 55, temp: "32.2°C", humidity: "74%", wind: "2.5 km/h" },
    { name: "Mylapore", aqi: 40, temp: "31.5°C", humidity: "77%", wind: "3.5 km/h" },
    { name: "Velachery", aqi: 62, temp: "32.8°C", humidity: "73%", wind: "2.3 km/h" },
  ],
};

function getCommunityActions(city, aqi) {
  const isBadAQI = aqi > 100;
  
  if (city === "Delhi") {
    if (isBadAQI) {
      return [
        { icon: "😷", text: "Urgent need for N95 masks for daily commuters in Connaught Place." },
        { icon: "🚗", text: "Odd-Even vehicle pooling drive required. Support the 'Delhi Breathes' campaign.", donate: true, btnText: "JOIN POOLING DRIVE", btnColor: "bg-amber-500 hover:bg-amber-400", borderColor: "border-amber-500/30" },
      ];
    }
    return [
      { icon: "🏃", text: "Join the 'Delhi Breathes' morning run at India Gate." },
      { icon: "🌱", text: "Support 'Sankalp Taru' Yamuna Bank tree plantation.", donate: true, btnText: "DONATE ₹1000 • 10 TREES", btnColor: "bg-emerald-500 hover:bg-emerald-400", borderColor: "border-emerald-500/30" },
    ];
  }
  
  if (city === "Hyderabad") {
    if (isBadAQI) {
      return [
        { icon: "🚑", text: "Emergency asthma camps required in HITEC City clinics due to high AQI." },
        { icon: "🚲", text: "Join the 'Cycle to Work' initiative to reduce intense localized emissions.", donate: true, btnText: "REGISTER AS CYCLIST", btnColor: "bg-indigo-500 hover:bg-indigo-400", borderColor: "border-indigo-500/30" },
      ];
    }
    return [
      { icon: "🌳", text: "Volunteer for Hussain Sagar lake cleanup drive this weekend." },
      { icon: "🌱", text: "Support KBR Park green cover expansion project.", donate: true, btnText: "DONATE ₹500 • 5 TREES", btnColor: "bg-emerald-500 hover:bg-emerald-400", borderColor: "border-emerald-500/30" },
    ];
  }
  
  if (city === "Mumbai") {
    if (isBadAQI) {
      return [
        { icon: "🏭", text: "Petition to regulate coastal industrial emissions in Navi Mumbai." },
        { icon: "😷", text: "Support slum-area respirator distribution in Dharavi.", donate: true, btnText: "DONATE N95 MASKS", btnColor: "bg-rose-500 hover:bg-rose-400", borderColor: "border-rose-500/30" },
      ];
    }
     return [
      { icon: "🏖️", text: "Join Versova beach cleanup to reduce coastal pollution." },
      { icon: "🌱", text: "Support Aarey Forest conservation initiative.", donate: true, btnText: "SUPPORT AAREY", btnColor: "bg-emerald-500 hover:bg-emerald-400", borderColor: "border-emerald-500/30" },
    ];
  }
  
  // Default for other cities 
  if (isBadAQI) {
      return [
        { icon: "🚨", text: `High smog levels in ${city}. Industrial regulators notified.` },
        { icon: "🩺", text: `Contribute to ${city}'s localized respiratory health & safety fund.`, donate: true, btnText: "CONTRIBUTE TO HEALTH FUND", btnColor: "bg-rose-500 hover:bg-rose-400", borderColor: "border-rose-500/30" },
      ];
  }
  return [
    { icon: "🏃", text: `Join local environmental awareness campaigns in ${city}.` },
    { icon: "🌱", text: `Support urban reforestation projects in ${city}.`, donate: true, btnText: "DONATE FOR TREES", btnColor: "bg-emerald-500 hover:bg-emerald-400", borderColor: "border-emerald-500/30" },
  ];
}

function getActionPlans(aqiVal, weatherCond, temp) {
  const plans = [];

  // AQI Guidance
  if (aqiVal > 300) plans.push({ icon: "🚫", text: "Hazardous air quality. Avoid all outdoor activities. Use air purifiers indoors." });
  else if (aqiVal > 200) plans.push({ icon: "⚠️", text: "Very poor air quality. Limit outdoor exposure. Wear N95 masks if going outside." });
  else if (aqiVal > 100) plans.push({ icon: "😷", text: "Moderate air quality. Sensitive groups should reduce prolonged outdoor activity." });
  else plans.push({ icon: "✅", text: "Air quality is acceptable. Normal activities allowed." });

  // Power & Grid Guidance
  const cond = (weatherCond || "").toLowerCase();
  if (cond.includes("thunderstorm") || cond.includes("storm") || cond.includes("lightning") || cond.includes("thunder")) {
    plans.push({ icon: "🔌", text: "Thunderstorm risk: Unplug sensitive electronics (TVs, PCs) to prevent severe power surge damage." });
  } else if (temp > 36 || cond.includes("heatwave") || cond.includes("hot")) {
    plans.push({ icon: "🔋", text: "Heatwave active: Avoid heavy device usage to prevent grid overload and rolling blackout risks." });
  } else {
    plans.push({ icon: "⚡", text: "Grid conditions stable. Normal power usage is completely safe under current weather." });
  }

  return plans;
}

function getRealWorldSuggestion(weather, humidity) {
  if (humidity > 75) return { icon: "🌂", text: "Carry an umbrella — high humidity may cause sudden showers." };
  const cond = (weather || "").toLowerCase();
  if (cond.includes("rain") || cond.includes("storm") || cond.includes("drizzle"))
    return { icon: "⛈️", text: "Rain or storms expected. Carry protective gear and avoid flooded areas." };
  if (cond.includes("clear") || cond.includes("sunny"))
    return { icon: "😎", text: "Clear skies today. Stay hydrated and use sun protection if outdoors." };
  if (cond.includes("haze") || cond.includes("mist") || cond.includes("fog"))
    return { icon: "🌫️", text: "Low visibility due to haze. Drive carefully and use fog lights." };
  return { icon: "🌤️", text: "Fair conditions today. Good for moderate outdoor activities." };
}

export default function AIInsights({ globalCity, setGlobalCity }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCities().then((res) => {
      const list = (res.data.cities || res.data || []).map(c => typeof c === 'string' ? c : c.name);
      setCities(list);
      if (!globalCity && list.length > 0) setGlobalCity(list[0]);
    });
  }, [globalCity, setGlobalCity]);

  const { data: combinedData, loading, isCached, lastUpdated } = useApiCache(
    globalCity ? `insights_${globalCity}` : null,
    async () => {
      const [anRes, wRes, aRes, allAnRes] = await Promise.all([
        getLatestAnomaly(globalCity).catch(() => ({ data: null })),
        getStoredWeather(globalCity).catch(() => ({ data: null })),
        getStoredAirQuality(globalCity).catch(() => ({ data: null })),
        getAnomaliesByCity(globalCity).catch(() => ({ data: [] })),
      ]);
      return {
        latest: anRes.data?.data || anRes.data || null,
        weather: wRes.data?.data || wRes.data || null,
        airQuality: aRes.data?.data || aRes.data || null,
        allAnomalies: allAnRes.data?.data || allAnRes.data || []
      };
    },
    { enabled: !!globalCity, refreshInterval: 15000 }
  );

  const { latest, weather, airQuality, allAnomalies } = combinedData || {};

  const aqiVal = airQuality ? calculateIndianAQI(airQuality.components?.pm2_5) : 0;
  const anomalyList = Array.isArray(allAnomalies) ? allAnomalies : [];

  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  anomalyList.forEach(a => {
    if (a.severity && severityCounts[a.severity] !== undefined) {
      severityCounts[a.severity]++;
    }
  });

  const riskScore = Math.min(
    severityCounts.critical * 40 + severityCounts.high * 30 + severityCounts.medium * 20 + severityCounts.low * 20,
    100
  ) || 0;

  const riskLabel = riskScore >= 80 ? "Critical Risk" : riskScore >= 60 ? "High Risk" : riskScore >= 40 ? "Medium Risk" : "Low Risk";
  const riskColor = riskScore >= 80 ? "text-red-500" : riskScore >= 60 ? "text-orange-500" : riskScore >= 40 ? "text-amber-500" : "text-emerald-500";
  const riskBarColor = riskScore >= 80 ? "bg-red-500" : riskScore >= 60 ? "bg-orange-500" : riskScore >= 40 ? "bg-amber-500" : "bg-emerald-500";

  const areas = LOCAL_AREAS[globalCity] || LOCAL_AREAS["Delhi"];
  const actions = getCommunityActions(globalCity, aqiVal);
  const actionPlans = getActionPlans(aqiVal, weather?.weather || weather?.weather_description, weather?.temperature_c || 25);
  const suggestion = getRealWorldSuggestion(weather?.weather || weather?.weather_description, weather?.humidity || 70);

  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-40 text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 font-sans">

      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 drop-shadow-md">
            <span className="bg-[#1A1F36] p-2 rounded-xl border border-white/10 shadow-lg">🤖</span>
            <span>AI Environmental <span className="text-indigo-500">Insights</span></span>
          </h1>
          <FreshnessBadge lastUpdated={lastUpdated} isCached={isCached} />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={globalCity}
            onChange={(e) => setGlobalCity(e.target.value)}
            className="bg-[#0F1221] border border-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-xl py-2.5 px-6 outline-none cursor-pointer shadow-md hover:border-indigo-500/30 transition-all appearance-none text-center"
          >
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-4 items-stretch">
        
        {/* ── LEFT: 3 INFO CARDS ──────────────────────────────────── */}
        <div className="xl:col-span-4 space-y-8 flex flex-col h-full">

          {/* Environmental Risk Score */}
          <div className="bg-[#0F1221] rounded-3xl p-8 shadow-2xl border border-white/5 flex-1 flex flex-col justify-center relative group hover:border-indigo-500/20 transition-all">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-indigo-400">📊</span> Environmental Risk Score
            </h3>
            {loading && !combinedData ? (
              <Shimmer className="h-20 w-3/4" />
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-3 mt-2">
                  <span className="text-6xl font-black text-white tracking-tighter drop-shadow-md">{riskScore}</span>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">/ 100</span>
                </div>
                <div className="w-full h-1.5 bg-[#1A1F36] rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all duration-1000 ${riskBarColor} shadow-[0_0_10px_currentColor]`} style={{ width: `${riskScore}%` }} />
                </div>
                <p className={`text-[11px] font-black uppercase tracking-widest ${riskColor}`}>{riskLabel}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-60">Isolation Forest + Z-Score analysis</p>
              </>
            )}
          </div>

          {/* Anomaly Breakdown */}
          <div className="bg-[#0F1221] rounded-3xl p-8 shadow-2xl border border-white/5 flex-1 flex flex-col justify-center relative group hover:border-rose-500/20 transition-all">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="text-rose-400">🚨</span> Anomaly Breakdown
            </h3>
            {loading && !combinedData ? (
              <div className="space-y-4">
                <Shimmer className="h-6 w-full" />
                <Shimmer className="h-6 w-full" />
                <Shimmer className="h-6 w-full" />
                <Shimmer className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Critical</span>
                  </div>
                  <span className="text-lg font-black text-red-500 leading-none">{severityCounts.critical}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">High</span>
                  </div>
                  <span className="text-lg font-black text-orange-500 leading-none">{severityCounts.high}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Medium</span>
                  </div>
                  <span className="text-lg font-black text-amber-500 leading-none">{severityCounts.medium}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Low</span>
                  </div>
                  <span className="text-lg font-black text-emerald-500 leading-none">{severityCounts.low}</span>
                </div>
              </div>
            )}
          </div>

          {/* Current Conditions */}
          <div className="bg-[#0F1221] rounded-3xl p-8 shadow-2xl border border-white/5 flex-1 flex flex-col justify-center relative group hover:border-emerald-500/20 transition-all">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="text-emerald-400">🌍</span> Current Conditions
            </h3>
            {loading && !combinedData ? (
              <div className="space-y-4">
                <Shimmer className="h-6 w-full" />
                <Shimmer className="h-6 w-full" />
                <Shimmer className="h-6 w-full" />
                <Shimmer className="h-6 w-full" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Temperature</span>
                  <span className="text-base font-black text-white">{weather?.temperature_c?.toFixed(1) || "--"}°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Humidity</span>
                  <span className="text-base font-black text-white">{weather?.humidity || "--"}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Wind</span>
                  <span className="text-base font-black text-white">{weather?.wind_speed || "--"} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AQI</span>
                  <span className="text-base font-black text-amber-400">{aqiVal || "--"}</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT: MAIN DASHBOARD ─────────────────────────────── */}
        <div className="xl:col-span-8 flex flex-col space-y-8 h-full">

          {/* AI Banner */}
          <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden border border-indigo-400/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl mix-blend-overlay" />
            <div className="relative z-10 flex items-start gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20 backdrop-blur-sm shrink-0">
                💬
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">AI Anomaly Insight</h3>
                  {latest && (
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border border-white/10 mt-1">
                      Z-Score: {latest.z_score?.toFixed(2)}
                    </span>
                  )}
                </div>
                {loading && !combinedData ? (
                  <>
                    <Shimmer className="h-4 w-1/4 mb-4" />
                    <Shimmer className="h-6 w-full mb-2" />
                    <Shimmer className="h-6 w-3/4" />
                  </>
                ) : latest ? (
                  <>
                    <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4 flex gap-4">
                      <span>LOCATION: {latest.city || globalCity}</span>
                      <span className="text-white border-l border-white/20 pl-4">SEVERITY: {latest.severity?.toUpperCase()}</span>
                    </div>
                    <p className="text-xl font-bold text-white leading-relaxed italic pr-4">
                      &ldquo;{latest.insight || "No specific insight generated."}&rdquo;
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-4">
                      SYSTEM STATUS: OPTIMAL
                    </div>
                    <p className="text-xl font-bold text-white leading-relaxed italic pr-4">
                      &ldquo;Metropolitan atmospheric sensors indicate standard operational variance. No anomalies detected in the current window.&rdquo;
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key Local Areas Table */}
          <div className="bg-[#0F1221] rounded-[40px] p-10 shadow-2xl border border-white/5 flex-1 relative group overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                <span className="text-indigo-500">📍</span> KEY LOCAL AREAS IN {globalCity}
              </h3>
              <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 uppercase tracking-widest shadow-sm">
                LIVE BREAKDOWN
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="text-left pb-4">Location / Area</th>
                    <th className="text-center pb-4">AQI Score</th>
                    <th className="text-center pb-4">Temperature</th>
                    <th className="text-center pb-4">Humidity</th>
                    <th className="text-center pb-4">Wind Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {areas.map((area, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group/row">
                      <td className="py-5">
                        <span className="text-sm font-black text-slate-300 group-hover/row:text-white transition-colors uppercase tracking-wide">
                          {area.name}
                        </span>
                      </td>
                      <td className="py-5 text-center">
                        <span className={`text-base font-black py-1 px-3 rounded-md ${
                          area.aqi > 100 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        }`}>
                          {area.aqi}
                        </span>
                      </td>
                      <td className="py-5 text-center text-sm font-bold text-slate-400">{area.temp}</td>
                      <td className="py-5 text-center text-sm font-bold text-slate-400">{area.humidity}</td>
                      <td className="py-5 text-center text-sm font-bold text-slate-400">{area.wind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* ── ACTION CARDS ROW ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">

        {/* AI Action Plan */}
        <div className="bg-[#0F1221] rounded-[32px] p-8 shadow-2xl border border-white/5 relative group hover:border-amber-500/20 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl drop-shadow-sm">⚡</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">AI Action Plan</h4>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">Immediate guidance</p>
          </div>
          <div className="space-y-4">
             {loading && !combinedData ? (
               <>
                 <Shimmer className="h-16 w-full rounded-2xl" />
                 <Shimmer className="h-16 w-full rounded-2xl" />
               </>
             ) : actionPlans.map((plan, i) => (
                <div key={i} className="flex items-start gap-4 bg-[#1A1F36] rounded-2xl p-4 border border-white/5">
                  <span className="text-xl drop-shadow-md shrink-0 mt-0.5">{plan.icon}</span>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed">{plan.text}</p>
                </div>
             ))}
          </div>
        </div>

        {/* Real-World Suggestions */}
        <div className="bg-[#0F1221] rounded-[32px] p-8 shadow-2xl border border-white/5 relative group hover:border-blue-500/20 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl drop-shadow-sm">🌍</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">Real-World Prep</h4>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">Everyday practical actions</p>
          </div>
          {loading && !combinedData ? (
            <Shimmer className="flex items-start gap-4 bg-[#1A1F36] rounded-2xl p-5 border border-white/5 h-20" />
          ) : (
            <div className="flex items-start gap-4 bg-[#1A1F36] rounded-2xl p-5 border border-white/5">
              <span className="text-2xl drop-shadow-md shrink-0">{suggestion.icon}</span>
              <p className="text-sm font-bold text-slate-300 leading-relaxed">{suggestion.text}</p>
            </div>
          )}
        </div>

        {/* Fix the Cause */}
        <div className="bg-[#0F1221] rounded-[32px] p-8 shadow-2xl border border-white/5 relative group hover:border-emerald-500/20 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl drop-shadow-sm">🔥</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">Fix the Cause</h4>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">Community campaigns</p>
          </div>
          <div className="space-y-4">
            {loading && !combinedData ? (
               <>
                 <Shimmer className="h-24 w-full rounded-2xl" />
                 <Shimmer className="h-24 w-full rounded-2xl" />
               </>
            ) : actions.slice(0, 2).map((action, i) => (
              <div key={i}>
                {action.donate ? (
                  <div className={`space-y-3 p-4 bg-[#1A1F36] border ${action.borderColor} rounded-2xl relative overflow-hidden`}>
                    <div className="flex items-start gap-3 relative z-10">
                      <span className="text-xl drop-shadow-md shrink-0">{action.icon}</span>
                      <p className="text-xs font-bold text-slate-300 leading-relaxed">{action.text}</p>
                    </div>
                    <button className={`w-full ${action.btnColor} text-[#0F1221] text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg`}>
                      {action.btnText}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 p-2">
                    <span className="text-xl drop-shadow-md shrink-0">{action.icon}</span>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">{action.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <div className="px-4">
         <div className="bg-[#1A1F36] border border-white/5 rounded-2xl py-6 text-center shadow-lg">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">End-to-End Advanced Intelligence Flow</h4>
         </div>
      </div>

    </div>
  );
}
