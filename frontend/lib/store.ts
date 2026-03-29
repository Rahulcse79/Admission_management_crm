import { create } from "zustand";
import Cookies from "js-cookie";
import api from "./api";
import type { User, LoginRequest, LoginResponse } from "./types";
import type { APIResponse } from "./api";
import { SECURE_COOKIE_OPTIONS, checkRateLimit, resetRateLimit } from "./security";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get("token") || null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials: LoginRequest) => {
    // Client-side rate limiting: 5 attempts per 60 seconds per email
    const rateLimitKey = `login:${credentials.email}`;
    const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey, 5, 60_000);
    if (!allowed) {
      const seconds = Math.ceil(retryAfterMs / 1000);
      throw { error: `Too many login attempts. Try again in ${seconds}s.` };
    }

    const response = (await api.post("/auth/login", credentials)) as APIResponse<LoginResponse>;
    if (response.success && response.data) {
      const { token, user } = response.data;
      // Use hardened cookie settings
      Cookies.set("token", token, SECURE_COOKIE_OPTIONS);
      // Reset rate limit on successful login
      resetRateLimit(rateLimitKey);
      set({ user, token, isAuthenticated: true, isLoading: false });
    }
  },

  logout: () => {
    Cookies.remove("token", { path: SECURE_COOKIE_OPTIONS.path });
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  checkAuth: async () => {
    const token = Cookies.get("token");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const response = (await api.get("/auth/me")) as APIResponse<User>;
      if (response.success && response.data) {
        set({ user: response.data, token, isAuthenticated: true, isLoading: false });
      }
    } catch {
      Cookies.remove("token", { path: SECURE_COOKIE_OPTIONS.path });
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
