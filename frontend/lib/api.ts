import axios from "axios";
import Cookies from "js-cookie";
import {
  sanitizePayload,
  generateNonce,
  generateRequestFingerprint,
  SECURE_COOKIE_OPTIONS,
} from "./security";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    // ── Anti-CSRF: signals this is an AJAX call, not a form submission ──
    "X-Requested-With": "XMLHttpRequest",
    // ── Prevent MIME-type sniffing ──
    "X-Content-Type-Options": "nosniff",
  },
  timeout: 15000,
  // Don't send cookies to third-party origins
  withCredentials: false,
});

// ── Request interceptor: security headers + sanitization ──
api.interceptors.request.use(
  async (config) => {
    // Attach JWT token
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp to prevent replay attacks
    const timestamp = new Date().toISOString();
    config.headers["X-Request-Timestamp"] = timestamp;

    // Add unique request nonce
    const nonce = generateNonce();
    config.headers["X-Request-Nonce"] = nonce;

    // Add request fingerprint (hash of method + url + timestamp)
    try {
      const fullUrl = `${config.baseURL || ""}${config.url || ""}`;
      const fingerprint = await generateRequestFingerprint(
        config.method?.toUpperCase() || "GET",
        fullUrl,
        timestamp
      );
      config.headers["X-Request-Fingerprint"] = fingerprint;
    } catch {
      // Fingerprint is best-effort; don't block the request
    }

    // Sanitize outgoing JSON payloads (skip password fields)
    if (config.data && typeof config.data === "object") {
      config.data = sanitizePayload(config.data, ["password", "token"]);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap data + handle 401 ──
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token", { path: SECURE_COOKIE_OPTIONS.path });
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    // Rate-limited by server
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const msg = retryAfter
        ? `Too many requests. Try again in ${retryAfter}s.`
        : "Too many requests. Please slow down.";
      return Promise.reject({ error: msg, status: 429 });
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

// ─── API Types ───────────────────────────────────

export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
