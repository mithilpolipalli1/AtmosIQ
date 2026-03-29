import axios from "axios";

const API_BASE = "https://atmosiq-xcj0.onrender.com";

const API = axios.create({
  baseURL: API_BASE,
  timeout: 45000, // 45s — handles Render free-tier cold starts (30-60s)
});

// ── Retry Interceptor with Exponential Backoff ──────────────────────────
// On timeout or 5xx errors, retry up to 3 times with increasing delay
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.__retryCount = config.__retryCount || 0;
    const MAX_RETRIES = 3;

    const isRetryable =
      error.code === "ECONNABORTED" || // timeout
      error.code === "ERR_NETWORK" ||   // network error (cold start)
      (error.response && error.response.status >= 500); // server error

    if (isRetryable && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = Math.min(1000 * Math.pow(2, config.__retryCount - 1), 8000); // 1s, 2s, 4s
      console.log(`⏳ Retry ${config.__retryCount}/${MAX_RETRIES} for ${config.url} in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return API(config);
    }

    return Promise.reject(error);
  }
);

// ── Keep-Alive Warm-Up ──────────────────────────────────────────────────
// Fires a lightweight ping to wake Render from cold sleep ASAP.
// Call this once when the app first loads.
let _warmupDone = false;
export const warmUpBackend = () => {
  if (_warmupDone) return;
  _warmupDone = true;
  console.log("🔥 Warming up backend...");
  fetch(API_BASE + "/", { mode: "cors" })
    .then(() => console.log("✅ Backend is warm"))
    .catch(() => console.log("⏳ Backend warming up..."));
};

// Cities (dropdown)
export const getCities = () => API.get("/cities");

// Live Data (cards)
export const getStoredWeather = (city) => API.get(`/stored/weather/${city}`);
export const getStoredAirQuality = (city) => API.get(`/stored/air-quality/${city}`);

// Graphs (history)
export const getHistoryWeather = (city) => API.get(`/history/weather/${city}`);
export const getHistoryAirQuality = (city) => API.get(`/history/air-quality/${city}`);

// Anomalies (alerts / highlight box)
export const getAnomaliesByCity = (city) => API.get(`/anomalies/${city}`);
export const getLatestAnomaly = (city, config) => API.get(`/anomalies/${city}/latest`, config);
export const triggerTestAnomaly = (city) => API.post(`/test/anomaly/${city}`);