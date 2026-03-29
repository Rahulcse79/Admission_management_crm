"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  FolderTree,
  GraduationCap,
  Calendar,
  Grid3X3,
  Users,
  UserPlus,
  ClipboardCheck,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "admission_officer", "management"] },
  { name: "Institutions", href: "/dashboard/institutions", icon: Building2, roles: ["admin"] },
  { name: "Campuses", href: "/dashboard/campuses", icon: MapPin, roles: ["admin"] },
  { name: "Departments", href: "/dashboard/departments", icon: FolderTree, roles: ["admin"] },
  { name: "Programs", href: "/dashboard/programs", icon: GraduationCap, roles: ["admin"] },
  { name: "Academic Years", href: "/dashboard/academic-years", icon: Calendar, roles: ["admin"] },
  { name: "Seat Matrix", href: "/dashboard/seat-matrix", icon: Grid3X3, roles: ["admin", "admission_officer", "management"] },
  { name: "Applicants", href: "/dashboard/applicants", icon: Users, roles: ["admin", "admission_officer", "management"] },
  { name: "New Applicant", href: "/dashboard/applicants/new", icon: UserPlus, roles: ["admin", "admission_officer"] },
  { name: "Admissions", href: "/dashboard/admissions", icon: ClipboardCheck, roles: ["admin", "admission_officer", "management"] },
  { name: "Users", href: "/dashboard/users", icon: Shield, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navigation.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-lg dark:bg-zinc-800 lg:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950",
          collapsed ? "w-[68px]" : "w-64",
          "max-lg:translate-x-0 max-lg:shadow-xl"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                E
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                EduMerge
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:block"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                    )}
                    title={item.name}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-indigo-500")} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          {!collapsed && user && (
            <div className="mb-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
