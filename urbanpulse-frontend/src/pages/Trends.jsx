import { useEffect, useState } from "react";
import { getCities, getHistoryWeather, getHistoryAirQuality } from "../api/api";
import { calculateIndianAQI } from "../utils/aqiCalc";
import { useApiCache } from "../utils/useApiCache";
import { FreshnessBadge, TableRowSkeleton } from "../components/LoadingSkeleton";

export default function Trends({ globalCity, setGlobalCity }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCities()
      .then((res) => {
        const raw = res.data.cities || res.data || [];
        const list = raw.map(c => typeof c === 'string' ? c : c.name);
        setCities(list);
        if (!globalCity && list.length > 0) setGlobalCity(list[0]);
      })
      .catch(console.error);
  }, [globalCity, setGlobalCity]);

  const { data, loading, isCached, lastUpdated } = useApiCache(
    globalCity ? `trends_${globalCity}` : null,
    async () => {
      const [wRes, aRes] = await Promise.all([
        getHistoryWeather(globalCity),
        getHistoryAirQuality(globalCity),
      ]);
      return {
        weatherHistory: wRes.data.data || wRes.data || [],
        aqiHistory: aRes.data.data || aRes.data || [],
      };
    },
    { enabled: !!globalCity }
  );

  const weatherHistory = data?.weatherHistory || [];
  const aqiHistory = data?.aqiHistory || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#0B0D17] rounded-3xl p-8 shadow-2xl border border-white/5 text-white">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">📊 <span>Historical Trends</span></h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Weather & Air Quality Data Logs</p>
        </div>
        <div className="flex items-center gap-6">
          <FreshnessBadge lastUpdated={lastUpdated} isCached={isCached} />
          <select
            value={globalCity}
            onChange={(e) => setGlobalCity(e.target.value)}
            className="bg-[#1A1F36] border border-[#2A2E46] text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl py-3 px-6 outline-none shadow-xl cursor-pointer hover:bg-blue-600 transition-colors"
          >
            {cities.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <>
        {/* Weather History Table */}
        <div className="bg-[#0B0D17] rounded-3xl p-10 shadow-2xl border border-white/5 text-white">
          <h2 className="text-sm font-bold mb-8 flex items-center gap-2">🌤 <span className="text-slate-400 uppercase tracking-widest">Weather History — {globalCity}</span></h2>
          <div className="overflow-x-auto max-h-72 overflow-y-auto pr-2">
            <table className="w-full text-sm table-auto">
              <thead className="text-slate-400 border-b border-[#2A2E46] sticky top-0 bg-[#1A1F36]">
                <tr>
                  <th className="py-3 text-left">Timestamp</th>
                  <th className="text-center">Temp (°C)</th>
                  <th className="text-center">Humidity (%)</th>
                  <th className="text-center">Wind (km/h)</th>
                  <th className="text-center">Condition</th>
                </tr>
              </thead>
              <tbody>
                {loading && weatherHistory.length === 0 ? (
                  <>
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                  </>
                ) : weatherHistory.length > 0 ? (
                  weatherHistory.slice(-20).reverse().map((w, i) => (
                    <tr key={i} className="border-b border-[#2A2E46] hover:bg-[#151928] transition text-slate-200">
                      <td className="py-2 text-left text-xs opacity-70">{new Date(w.source_timestamp * 1000).toLocaleString()}</td>
                      <td className="text-center font-medium">{w.temperature_c ?? w.temperature}°C</td>
                      <td className="text-center">{w.humidity}%</td>
                      <td className="text-center opacity-80">{w.wind_speed} km/h</td>
                      <td className="text-center text-xs opacity-80 uppercase font-bold">{w.weather || w.condition || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-500">No weather history available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AQI History Table */}
        <div className="bg-[#0B0D17] rounded-3xl p-10 shadow-2xl border border-white/5 text-white">
          <h2 className="text-sm font-bold mb-8 flex items-center gap-2">🌬 <span className="text-slate-400 uppercase tracking-widest">AQI History — {globalCity}</span></h2>
          <div className="overflow-x-auto max-h-72 overflow-y-auto pr-2">
            <table className="w-full text-sm table-auto">
              <thead className="text-slate-400 border-b border-[#2A2E46] sticky top-0 bg-[#1A1F36]">
                <tr>
                  <th className="py-3 text-left">Timestamp</th>
                  <th className="text-center">AQI</th>
                  <th className="text-center">PM2.5 (µg)</th>
                  <th className="text-center">PM10 (µg)</th>
                </tr>
              </thead>
              <tbody>
                {loading && aqiHistory.length === 0 ? (
                  <>
                    <TableRowSkeleton cols={4} />
                    <TableRowSkeleton cols={4} />
                    <TableRowSkeleton cols={4} />
                  </>
                ) : aqiHistory.length > 0 ? (
                  aqiHistory.slice(-20).reverse().map((a, i) => {
                    const computedAqi = calculateIndianAQI(a.components?.pm2_5);
                    return (
                    <tr key={i} className="border-b border-[#2A2E46] hover:bg-[#151928] transition text-slate-200">
                      <td className="py-2 text-left text-xs opacity-70">{new Date(a.source_timestamp * 1000).toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold inline-block border ${
                          computedAqi >= 301 ? "bg-purple-900/50 text-purple-400 border-purple-800"
                            : computedAqi >= 201 ? "bg-red-900/50 text-red-400 border-red-800"
                            : computedAqi >= 101 ? "bg-yellow-900/50 text-yellow-400 border-yellow-800"
                            : "bg-green-900/50 text-green-400 border-green-800"
                        }`}>
                          {computedAqi}
                        </span>
                      </td>
                      <td className="text-center">{a.components?.pm2_5 || "—"}</td>
                      <td className="text-center">{a.components?.pm10 || "—"}</td>
                    </tr>
                  )})
                ) : (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-slate-500">No air quality history available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    </div>
  );
}
