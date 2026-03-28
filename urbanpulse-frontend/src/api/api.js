import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://atmosiqbackend-r1ltcf8o.b4a.run",
});

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