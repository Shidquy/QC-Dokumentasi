// src/utils/api.js

/**
 * Mengambil URL dasar API backend secara dinamis:
 * 1. Jika ada environment variable VITE_API_BASE_URL, gunakan itu.
 * 2. Jika di browser, arahkan ke hostname yang sama dengan browser (IP LAN atau domain) port 5000.
 * 3. Fallback ke http://localhost:5000.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

