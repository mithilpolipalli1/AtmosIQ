// ── Loading Skeleton Components ─────────────────────────────────────────────
// Replace fake fallback data with animated skeletons so users know data is loading.

import React, { useState, useEffect } from "react";

/** Animated shimmer bar */
export function Shimmer({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded bg-white/5 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

/** Full table row skeleton */
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-6 px-2">
          <Shimmer className="h-4 w-16 mx-auto" />
        </td>
      ))}
    </tr>
  );
}

/** Card skeleton */
export function CardSkeleton({ className = "" }) {
  return (
    <div className={`bg-[#0F1221] border border-white/5 rounded-3xl p-6 shadow-2xl ${className}`}>
      <Shimmer className="h-3 w-24 mb-4" />
      <Shimmer className="h-10 w-20 mb-2" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

/** Data freshness badge */
export function FreshnessBadge({ lastUpdated, isCached }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10000); // update every 10s
    return () => clearInterval(id);
  }, []);

  if (!lastUpdated) return null;

  const ago = Math.max(0, Math.round((now - lastUpdated.getTime()) / 1000));
  const label = ago < 5 ? "Just now" : ago < 60 ? `${ago}s ago` : `${Math.round(ago / 60)}m ago`;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${isCached ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
        {isCached ? `CACHED • ${label}` : `LIVE • ${label}`}
      </span>
    </div>
  );
}

/** Full-page loading state with spinning orb */
export function PageLoader({ message = "Connecting to AtmosIQ..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-6">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{message}</p>
    </div>
  );
}
