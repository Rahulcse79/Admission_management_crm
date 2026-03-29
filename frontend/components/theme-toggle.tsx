"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
      <button
        onClick={() => setTheme("light")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "light"
            ? "bg-white text-amber-500 shadow-sm dark:bg-zinc-700"
            : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "dark"
            ? "bg-white text-indigo-500 shadow-sm dark:bg-zinc-700"
            : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`rounded-md p-1.5 transition-colors ${
          theme === "system"
            ? "bg-white text-teal-500 shadow-sm dark:bg-zinc-700"
            : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        }`}
        title="System"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}
