"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitMsg(null);
    setIsLoading(true);

    // Trim email to prevent whitespace-based bypasses
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { error?: string; status?: number };
      if (error?.status === 429 || error?.error?.includes("Too many")) {
        setRateLimitMsg(error.error || "Too many attempts. Please wait.");
        toast.error(error.error || "Too many login attempts");
      } else {
        toast.error(error?.error || "Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">EduMerge</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Admission Management
            <br />
            <span className="text-indigo-200">& CRM System</span>
          </h1>
          <p className="max-w-md text-lg text-indigo-100">
            Configure programs, manage applicants, allocate seats, and track the
            entire admission lifecycle — all in one place.
          </p>
          <div className="flex gap-8 text-sm text-indigo-200">
            <div>
              <div className="text-2xl font-bold text-white">100%</div>
              <div>Quota Compliant</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Real-time</div>
              <div>Seat Tracking</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Secure</div>
              <div>Role-based Access</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-indigo-300">
          © 2026 EduMerge. Built for modern admissions.
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center bg-white px-6 dark:bg-zinc-950 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold gradient-text">EduMerge</span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Welcome back
            </h2>
            <p className="mt-2 text-zinc-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {rateLimitMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>{rateLimitMsg}</span>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edumerge.com"
                required
                autoComplete="username"
                spellCheck={false}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-11 text-sm transition-colors placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Demo Credentials
            </p>
            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span>admin@edumerge.com / Admin@123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Officer:</span>
                <span>officer@edumerge.com / Officer@123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Management:</span>
                <span>management@edumerge.com / Mgmt@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
