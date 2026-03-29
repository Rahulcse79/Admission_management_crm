// ─── Security Utilities ─────────────────────────
// Client-side security: rate limiting, sanitization, fingerprinting, CSRF

// ─── Rate Limiter ───────────────────────────────
// Sliding-window rate limiter to prevent brute-force login attempts

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterMs: number;
}

/**
 * Check if an action is rate-limited.
 * @param key   Unique key (e.g. "login" or "login:email@example.com")
 * @param maxAttempts  Max allowed attempts in the window
 * @param windowMs     Sliding window duration in ms
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Evict expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxAttempts) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterMs,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}

// ─── Input Sanitization ────────────────────────
// Strip dangerous HTML/script patterns from user input

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<form\b[^>]*>/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*["']?\s*javascript/gi,
];

/**
 * Sanitize a string by removing XSS vectors.
 * NOTE: This is for API JSON payloads, NOT HTML rendering.
 * We only strip dangerous script/event patterns — we do NOT HTML-encode
 * because the backend stores raw text, and encoding would corrupt data
 * (e.g. O'Brien → O&#x27;Brien, AT&T → AT&amp;T).
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;
  let clean = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  return clean.trim();
}

/**
 * Deep-sanitize an object's string values before sending to API.
 * Skips password fields (they may contain special chars).
 */
export function sanitizePayload<T>(obj: T, skipKeys: string[] = ["password"]): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeString(obj) as T;
  if (Array.isArray(obj)) return obj.map((item) => sanitizePayload(item, skipKeys)) as T;
  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (skipKeys.includes(key)) {
        cleaned[key] = value; // Don't sanitize passwords
      } else {
        cleaned[key] = sanitizePayload(value, skipKeys);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// ─── Request Fingerprint / Timestamp ────────────
// Adds timestamp and basic hash to prevent replay attacks

/**
 * Generate a request nonce (unique per request).
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a simple HMAC-like fingerprint for request integrity.
 * Not a replacement for server-side validation, but raises the bar.
 */
export async function generateRequestFingerprint(
  method: string,
  url: string,
  timestamp: string
): Promise<string> {
  const message = `${method}:${url}:${timestamp}`;
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);
  }
  // Fallback: simple hash
  let h = 0;
  for (let i = 0; i < message.length; i++) {
    h = ((h << 5) - h + message.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
}

// ─── Secure Cookie Options ──────────────────────

export const SECURE_COOKIE_OPTIONS = {
  expires: 1, // 1 day
  sameSite: "strict" as const,
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  path: "/",
};

// ─── CSP Nonce ──────────────────────────────────
// For inline scripts if needed

let _cspNonce: string | null = null;
export function getCspNonce(): string {
  if (!_cspNonce) {
    _cspNonce = generateNonce();
  }
  return _cspNonce;
}
