"use client";

import { ThemeToggle } from "./theme-toggle";
import { useAuthStore } from "@/lib/store";
import { Bell } from "lucide-react";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Admission Management CRM
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>
        <ThemeToggle />
        {user && (
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
