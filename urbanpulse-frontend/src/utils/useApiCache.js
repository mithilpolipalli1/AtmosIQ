// ── useApiCache: Cache-First Data Fetching Hook ─────────────────────────────
// Shows cached data instantly on mount, then fetches fresh data in background.
// Returns { data, loading, isCached, lastUpdated, error }

import { useState, useEffect, useRef, useCallback } from "react";
import { getCache, setCache } from "./cache";

/**
 * @param {string} cacheKey  - Unique key for this data set (e.g. "overview_Hyderabad")
 * @param {() => Promise<any>} fetchFn - Async function that returns the data
 * @param {object} opts
 * @param {number} opts.refreshInterval - Auto-refresh interval in ms (default: 15000)
 * @param {boolean} opts.enabled - Whether to fetch (default: true)
 */
export function useApiCache(cacheKey, fetchFn, opts = {}) {
  const { refreshInterval = 15000, enabled = true } = opts;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // On mount / key change: load cache first
  useEffect(() => {
    if (!enabled || !cacheKey) return;
    const cached = getCache(cacheKey);
    if (cached && cached.data) {
      setData(cached.data);
      setIsCached(true);
      setLoading(false);
      setLastUpdated(new Date(Date.now() - cached.age));
    }
  }, [cacheKey, enabled]);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await fetchFn();
      if (!mountedRef.current) return;
      setData(result);
      setCache(cacheKey, result);
      setIsCached(false);
      setLastUpdated(new Date());
      setError(null);
      setLoading(false);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err);
      // If we have no data at all, stop loading to show error state
      setLoading((prev) => (data ? false : prev));
    }
  }, [cacheKey, fetchFn, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch fresh data on mount and on interval
  useEffect(() => {
    if (!enabled) return;
    mountedRef.current = true;
    fetchData();
    const id = refreshInterval > 0 ? setInterval(fetchData, refreshInterval) : null;
    return () => {
      mountedRef.current = false;
      if (id) clearInterval(id);
    };
  }, [fetchData, refreshInterval, enabled]);

  return { data, loading, isCached, lastUpdated, error, refetch: fetchData };
}
