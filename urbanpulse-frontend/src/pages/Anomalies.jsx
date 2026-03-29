import { useEffect, useState } from "react";
import { getCities, getAnomaliesByCity, getLatestAnomaly } from "../api/api";
import { useApiCache } from "../utils/useApiCache";
import { Shimmer, FreshnessBadge } from "../components/LoadingSkeleton";

export default function Anomalies({ globalCity, setGlobalCity }) {
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

  const { data: combinedData, loading, isCached, lastUpdated } = useApiCache(
    globalCity ? `anomalies_${globalCity}` : null,
    async () => {
      const [anRes, lRes] = await Promise.all([
        getAnomaliesByCity(globalCity).catch(() => ({ data: [] })),
        getLatestAnomaly(globalCity).catch(() => ({ data: null })),
      ]);
      return {
        anomalies: anRes.data?.data || anRes.data || [],
        latest: lRes.data?.data || lRes.data || null,
      };
    },
    { enabled: !!globalCity, refreshInterval: 10000 }
  );

  const anomalies = combinedData?.anomalies || [];
  const latest = combinedData?.latest || null;

  const getSeverityColor = (severity) => {
    const map = {
      low: "bg-emerald-500",
      medium: "bg-amber-500",
      high: "bg-orange-500",
      critical: "bg-red-500",
    };
    return map[severity] || map.low;
  };

  const getSeverityBadge = (severity) => {
    const map = {
      low: "text-emerald-600 border-emerald-400 bg-emerald-50",
      medium: "text-amber-600 border-amber-400 bg-amber-50",
      high: "text-orange-600 border-orange-400 bg-orange-50",
      critical: "text-red-600 border-red-400 bg-red-50",
    };
    return map[severity] || map.low;
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-20 text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🚨 <span>Anomaly Detection</span>
          </h1>
          <FreshnessBadge lastUpdated={lastUpdated} isCached={isCached} />
        </div>
        <select
          value={globalCity}
          onChange={(e) => setGlobalCity(e.target.value)}
          className="bg-[#1A1F36] border border-[#2A2E46] text-white text-xs font-bold rounded-xl py-2 px-4 outline-none cursor-pointer"
        >
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Latest Anomaly */}
      <div>
        <h2 className="text-lg font-bold mb-4">Latest Anomaly</h2>
        {loading && !latest ? (
           <div className="bg-[#0F1221] border border-white/10 rounded-2xl p-6 shadow-lg">
             <Shimmer className="h-6 w-1/3 mb-4" />
             <Shimmer className="h-4 w-1/4 mb-1" />
             <Shimmer className="h-3 w-1/2 mt-4 pt-4 border-t border-white/5" />
           </div>
        ) : latest ? (
          <div className="bg-[#0F1221] border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(latest.severity)}`} />
                  <span className="text-lg font-bold text-emerald-400">{latest.metric_name || "AQI"}</span>
                </div>
                <p className="text-sm text-slate-400">
                  Severity: <span className="font-bold text-white">{latest.severity?.toUpperCase()}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(latest.source_timestamp * 1000).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">
                  Z-Score: <span className="font-bold text-white">{latest.z_score?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-slate-400">
                  ML Score: <span className="font-bold text-white">{latest.ml_score?.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-4 pt-4 border-t border-white/5">
              <span className="text-lg">🔮</span>
              <p className="text-sm text-emerald-400 italic">
                {latest.insight || "No specific insight generated."}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0F1221] border border-white/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm">Live syncing — waiting for anomaly detection...</p>
            </div>
          </div>
        )}
      </div>

      {/* All Anomalies */}
      <div>
        <h2 className="text-lg font-bold mb-4">All Anomalies — {globalCity}</h2>
        <div className="space-y-3">
          {loading && anomalies.length === 0 ? (
             <div className="bg-[#0F1221] border border-white/10 rounded-2xl p-5">
                <Shimmer className="h-4 w-1/3 mb-3" />
                <Shimmer className="h-4 w-2/3" />
             </div>
          ) : anomalies.length > 0 ? anomalies.map((an, i) => (
            <div key={an.id || i} className="bg-[#0F1221] border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(an.severity)}`} />
                    <span className="font-bold text-emerald-400">{an.metric_name || "AQI"}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(an.source_timestamp * 1000).toLocaleString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${getSeverityBadge(an.severity)}`}>
                  {an.severity}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span>🔮</span>
                <p className="text-sm text-emerald-400 italic">
                  {an.insight || "Anomaly detected."}
                </p>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
              <div className="flex items-center justify-center gap-3 text-slate-500">
                <div className="w-4 h-4 border-2 border-slate-700 border-t-slate-500 rounded-full animate-spin" />
                <p className="text-sm">Collecting data — anomalies will appear automatically</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
