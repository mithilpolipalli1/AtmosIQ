// ── LocalStorage Cache Layer ────────────────────────────────────────────
// Provides instant data on page load while fresh data is being fetched.
// Data is cached per key with a staleness threshold.

const CACHE_PREFIX = "atmosiq_";
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data from localStorage.
 * Returns { data, isFresh } or null if no cache exists.
 */
export function getCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - (parsed._cachedAt || 0);
    return {
      data: parsed.data,
      isFresh: age < STALE_THRESHOLD_MS,
      age,
    };
  } catch {
    return null;
  }
}

/**
 * Save data to localStorage cache.
 */
export function setCache(key, data) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, _cachedAt: Date.now() })
    );
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Clear all AtmosIQ cached data.
 */
export function clearCache() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
