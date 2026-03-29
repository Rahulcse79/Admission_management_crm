"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

// Read saved theme without triggering React effect warnings
function getSavedTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  return "system";
}

// Subscribe to nothing — we just need a consistent snapshot
const emptySubscribe = () => () => {};

export function ThemeProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore is SSR-safe: returns "system" on server, saved theme on client
  const savedTheme = useSyncExternalStore(emptySubscribe, getSavedTheme, () => "system" as Theme);
  const [theme, setThemeState] = useState<Theme>(savedTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const mountedRef = useRef(false);

  // Apply theme class to <html> element
  useEffect(() => {
    mountedRef.current = true;
    const root = document.documentElement;

    const applyTheme = (t: Theme) => {
      let resolved: "light" | "dark";
      if (t === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        resolved = t;
      }
      setResolvedTheme(resolved);
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
