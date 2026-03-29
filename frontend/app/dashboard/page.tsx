"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const QUOTA_COLORS: Record<string, string> = {
  KCET: "#6366f1",
  COMEDK: "#8b5cf6",
  Management: "#ec4899",
};

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data);
    } catch {
      /* toast handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-zinc-500">Unable to load dashboard data. Make sure the backend is running.</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Intake", value: stats.total_intake, icon: Users, color: "from-indigo-500 to-indigo-600" },
    { label: "Admitted", value: stats.total_admitted, icon: GraduationCap, color: "from-emerald-500 to-emerald-600" },
    { label: "Remaining Seats", value: stats.total_remaining, icon: ClipboardCheck, color: "from-amber-500 to-amber-600" },
    { label: "Pending Docs", value: stats.pending_documents, icon: FileCheck, color: "from-rose-500 to-rose-600" },
    { label: "Pending Fees", value: stats.pending_fees, icon: Clock, color: "from-violet-500 to-violet-600" },
    { label: "Confirmed", value: stats.confirmed_admissions, icon: TrendingUp, color: "from-cyan-500 to-cyan-600" },
  ];

  const quotaChartData = stats.quota_stats?.map((q) => ({
    name: q.quota_type,
    Total: q.total,
    Filled: q.filled,
    Remaining: q.remaining,
  })) ?? [];

  const programChartData = stats.program_stats?.map((p) => ({
    name: p.program_name,
    value: p.total_intake,
    admitted: p.total_admitted,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Overview of admission statistics for the current academic year.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${card.color} opacity-0 transition-opacity group-hover:opacity-100`} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quota-wise Bar Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quota-wise Seat Allocation</h3>
          {quotaChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={quotaChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-zinc-200)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-white, #fff)",
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Filled" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Remaining" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-60 items-center justify-center text-sm text-zinc-400">
              No seat matrix data configured yet.
            </p>
          )}
        </div>

        {/* Program-wise Pie Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Program-wise Intake Distribution</h3>
          {programChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={programChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {programChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-60 items-center justify-center text-sm text-zinc-400">
              No program data available yet.
            </p>
          )}
        </div>
      </div>

      {/* Program Stats Table */}
      {stats.program_stats && stats.program_stats.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Program-wise Admission Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-5 py-3 text-left font-medium text-zinc-500">Program</th>
                  <th className="px-5 py-3 text-right font-medium text-zinc-500">Total Intake</th>
                  <th className="px-5 py-3 text-right font-medium text-zinc-500">Admitted</th>
                  <th className="px-5 py-3 text-right font-medium text-zinc-500">Remaining</th>
                  <th className="px-5 py-3 text-right font-medium text-zinc-500">Fill Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.program_stats.map((p) => {
                  const rate = p.total_intake > 0 ? Math.round((p.total_admitted / p.total_intake) * 100) : 0;
                  return (
                    <tr key={p.program_id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.program_name}</td>
                      <td className="px-5 py-3 text-right text-zinc-600 dark:text-zinc-400">{p.total_intake}</td>
                      <td className="px-5 py-3 text-right text-zinc-600 dark:text-zinc-400">{p.total_admitted}</td>
                      <td className="px-5 py-3 text-right text-zinc-600 dark:text-zinc-400">{p.total_remaining}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          rate >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : rate >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}>{rate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Admissions */}
      {stats.recent_admissions && stats.recent_admissions.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Admissions</h3>
            <Link href="/dashboard/admissions" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.recent_admissions.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.applicant_name}</p>
                  <p className="text-xs text-zinc-500">{a.program_name} · {a.quota_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{a.admission_number || "Pending"}</p>
                  <p className={`text-xs ${a.is_confirmed ? "text-emerald-600" : "text-amber-500"}`}>
                    {a.is_confirmed ? "Confirmed" : "Provisional"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quota breakdown inline cards */}
      {stats.quota_stats && stats.quota_stats.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quota Breakdown</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.quota_stats.map((q) => {
              const pct = q.total > 0 ? Math.round((q.filled / q.total) * 100) : 0;
              return (
                <div key={q.quota_type} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: QUOTA_COLORS[q.quota_type] ?? "#6366f1" }} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{q.quota_type}</span>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{q.filled}<span className="text-sm font-normal text-zinc-400">/{q.total}</span></p>
                    <span className="text-xs font-medium text-zinc-500">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: QUOTA_COLORS[q.quota_type] ?? "#6366f1" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
