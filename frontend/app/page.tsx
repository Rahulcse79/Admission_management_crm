"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  BarChart3,
  Shield,
  Zap,
  Grid3X3,
  ArrowRight,
  ChevronRight,
  Star,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

/* ───────── Animated counter hook ───────── */
function useCounter(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration, start]);

  return { count, trigger: () => setStarted(true) };
}

/* ───────── Feature card data ───────── */
const features = [
  {
    icon: Building2,
    title: "Multi-Institution",
    desc: "Manage multiple institutions, campuses, and departments from a single dashboard.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Grid3X3,
    title: "Seat Matrix",
    desc: "Quota-wise seat allocation with real-time fill tracking across KCET, COMEDK & Management.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Applicant Lifecycle",
    desc: "Track applicants from application to admission — documents, fees, and status updates.",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: ClipboardCheck,
    title: "Admission Engine",
    desc: "Allocate seats, confirm admissions, auto-generate admission numbers in one click.",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    desc: "Interactive charts showing quota utilization, program fill-rates, and admission trends.",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Shield,
    title: "Role-based Access",
    desc: "Admin, Officer & Management roles with granular permissions and secure JWT auth.",
    color: "from-cyan-500 to-cyan-600",
  },
];

/* ───────── Testimonials ───────── */
const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Dean of Admissions, VTU",
    text: "EduMerge cut our admission processing time by 70%. The quota tracking alone is worth it.",
    avatar: "PS",
  },
  {
    name: "Rahul Menon",
    role: "Admission Officer, RVCE",
    text: "Finally a CRM that understands Indian admission workflows — KCET, COMEDK, Management quotas all in one place.",
    avatar: "RM",
  },
  {
    name: "Anita Kulkarni",
    role: "Registrar, BMS College",
    text: "The real-time seat matrix is a game-changer. No more spreadsheets or manual counting.",
    avatar: "AK",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const mountedRef = useRef(false);

  const stat1 = useCounter(50, 2000);
  const stat2 = useCounter(10000, 2500);
  const stat3 = useCounter(99, 1800);
  const stat4 = useCounter(3, 1500);

  useEffect(() => {
    checkAuth();
    mountedRef.current = true;
  }, [checkAuth]);

  // Auto-redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
            // Trigger stat counters
            if (entry.target.id === "stats") {
              stat1.trigger();
              stat2.trigger();
              stat3.trigger();
              stat4.trigger();
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [stat1, stat2, stat3, stat4]);

  const isVisible = (id: string) => visibleSections.has(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <GraduationCap className="absolute inset-0 m-auto h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Loading EduMerge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* ───────── Navbar ───────── */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">EduMerge</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">Features</a>
            <a href="#stats" className="text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">Stats</a>
            <a href="#testimonials" className="text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="group flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── Hero Section ───────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] animate-float" />
          <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] animate-float-delayed" />
          <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-pink-500/5 blur-[80px] animate-float-slow" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 px-4 py-1.5 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-indigo-950/50 animate-fade-in">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Built for Indian College Admissions</span>
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl animate-fade-in-up">
            Admissions,{" "}
            <span className="relative inline-block">
              <span className="gradient-text">Simplified</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" className="animate-draw" />
                <defs>
                  <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-xl animate-fade-in-up-delay">
            Configure programs, manage applicants, allocate quota-wise seats, and track the entire admission lifecycle — all from one beautiful dashboard.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up-delay-2">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 hover:brightness-110"
            >
              Start Managing Admissions
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-8 py-3.5 text-base font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
            >
              Explore Features
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {/* Hero visual — Dashboard preview mockup */}
          <div className="relative mx-auto mt-16 max-w-5xl animate-fade-in-up-delay-3">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-800/60 dark:bg-zinc-900 dark:shadow-zinc-950/50">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex h-7 w-80 items-center justify-center rounded-md bg-zinc-200/50 text-xs text-zinc-400 dark:bg-zinc-800">
                  dashboard.edumerge.com
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Total Intake", value: "1,200", color: "indigo" },
                    { label: "Admitted", value: "847", color: "emerald" },
                    { label: "Remaining", value: "353", color: "amber" },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
                    >
                      <p className="text-xs text-zinc-500">{card.label}</p>
                      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className={`h-full rounded-full ${
                            card.color === "indigo" ? "bg-indigo-500 w-full" :
                            card.color === "emerald" ? "bg-emerald-500 w-[70%]" :
                            "bg-amber-500 w-[30%]"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mini chart bars */}
                <div className="mt-4 flex items-end justify-center gap-2 py-4">
                  {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 45].map((h, i) => (
                    <div
                      key={i}
                      className="w-6 rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-400 opacity-80 transition-all hover:opacity-100"
                      style={{ height: `${h}px`, animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Glow effect behind the card */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* ───────── Trusted By ───────── */}
      <section className="border-y border-zinc-200/50 bg-zinc-50/50 py-12 dark:border-zinc-800/50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-widest text-zinc-400">Trusted by leading institutions</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["VTU", "RVCE", "BMS", "PES University", "Dayananda Sagar", "JSS"].map((name) => (
              <span key={name} className="text-lg font-bold text-zinc-300 transition-colors hover:text-indigo-500 dark:text-zinc-700 dark:hover:text-indigo-400">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Features Grid ───────── */}
      <section id="features" data-animate className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className={`text-center transition-all duration-700 ${isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Zap className="h-3.5 w-3.5" /> POWERFUL FEATURES
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
              Everything you need to manage admissions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
              From institution setup to admission confirmation — a complete toolkit built for how Indian colleges actually work.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900 ${
                  isVisible("features") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 blur-3xl transition-opacity group-hover:opacity-10`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Stats Section ───────── */}
      <section id="stats" data-animate className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className={`text-center transition-all duration-700 ${isVisible("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Numbers that speak</h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-200">
              Powering admissions across Karnataka&apos;s top engineering colleges.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: stat1.count, suffix: "+", label: "Institutions", icon: Building2 },
              { value: stat2.count.toLocaleString(), suffix: "+", label: "Applications Processed", icon: Users },
              { value: stat3.count, suffix: ".9%", label: "Uptime", icon: Zap },
              { value: stat4.count, suffix: " Quotas", label: "Fully Supported", icon: Grid3X3 },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`rounded-2xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-500 hover:bg-white/15 ${
                  isVisible("stats") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <stat.icon className="mx-auto mb-4 h-8 w-8 text-indigo-200" />
                <p className="text-4xl font-extrabold text-white">
                  {stat.value}{stat.suffix}
                </p>
                <p className="mt-2 text-sm text-indigo-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How It Works ───────── */}
      <section id="how-it-works" data-animate className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className={`text-center transition-all duration-700 ${isVisible("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">Three steps to streamlined admissions.</p>
          </div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="pointer-events-none absolute left-0 right-0 top-20 hidden h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 md:block" />

            {[
              { step: "01", title: "Configure", desc: "Set up institutions, campuses, programs, academic years, and quota-wise seat matrices." },
              { step: "02", title: "Process", desc: "Register applicants, verify documents, allocate seats, and track fee payments." },
              { step: "03", title: "Confirm", desc: "Confirm admissions, generate admission numbers, and monitor real-time analytics." },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`relative text-center transition-all duration-500 ${
                  isVisible("how-it-works") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-xl shadow-indigo-500/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Testimonials ───────── */}
      <section id="testimonials" data-animate className="bg-zinc-50/50 py-24 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className={`text-center transition-all duration-700 ${isVisible("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">Loved by admission teams</h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
              Hear what institution administrators have to say.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 ${
                  isVisible("testimonials") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Final CTA ───────── */}
      <section id="cta" data-animate className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className={`transition-all duration-700 ${isVisible("cta") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-8 py-16 shadow-2xl sm:px-16">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
              <div className="relative z-10">
                <CheckCircle2 className="mx-auto mb-6 h-14 w-14 text-indigo-200" />
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to modernize your admissions?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-lg text-indigo-200">
                  Join 50+ institutions already using EduMerge to streamline their admission process.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="/login"
                    className="group flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:shadow-xl hover:brightness-105"
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10"
                  >
                    View Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold gradient-text">EduMerge</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-zinc-500">
              <a href="#features" className="transition-colors hover:text-indigo-600">Features</a>
              <a href="#stats" className="transition-colors hover:text-indigo-600">Stats</a>
              <a href="#testimonials" className="transition-colors hover:text-indigo-600">Testimonials</a>
              <Link href="/login" className="transition-colors hover:text-indigo-600">Sign In</Link>
            </div>
            <p className="text-sm text-zinc-400">© 2026 EduMerge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
