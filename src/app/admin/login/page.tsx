"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { DuckLogo } from "@/components/ui/DuckLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState("/admin");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get("callbackUrl");
      if (cb) setCallbackUrl(cb);
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const err = data.error || "Authentication failed. Check your executive credentials.";
        setErrorMsg(err);
        toastError(err);
        setLoading(false);
        return;
      }

      toastSuccess("Authentication successful. Welcome to Duck Executive Atelier.");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      const msg = "Network error while connecting to authentication service.";
      setErrorMsg(msg);
      toastError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8F6FA] text-text-dark selection:bg-primary selection:text-white">
      {/* LEFT COLUMN: Editorial Luxury Brand Visual (Desktop / Tablet LG+) */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 xl:p-16 bg-primary overflow-hidden">
        {/* Editorial Background Image with Rich Purple Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1400&auto=format&fit=crop"
            alt="Duck Cosmetics Atelier Formulation"
            fill
            sizes="50vw"
            priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E1840] via-[#5D3A7A]/80 to-[#5D3A7A]/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2E1840]/90 via-transparent to-transparent" />
        </div>

        {/* Top Brand Provenance */}
        <div className="relative z-10">
          <Link href="/" className="inline-block group" aria-label="Return to Storefront">
            <DuckLogo variant="white" className="h-10 w-auto max-w-[170px] drop-shadow-sm transition-transform duration-300 group-hover:scale-102" priority />
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-sans font-semibold tracking-widest uppercase text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Executive Operations Portal
            </span>
          </div>
        </div>

        {/* Center / Bottom Editorial Quote & Credentials Note */}
        <div className="relative z-10 space-y-6 max-w-md">
          <blockquote className="space-y-3">
            <p className="font-serif text-2xl xl:text-3xl text-white font-normal leading-snug drop-shadow-sm">
              &ldquo;Where uncompromising clinical dermatology meets haute couture beauty pleasure.&rdquo;
            </p>
            <footer className="text-xs font-sans tracking-widest uppercase text-white/75 font-semibold">
              — Duck Cosmetics Atelier Maison
            </footer>
          </blockquote>

          {/* Frosted Security Badge */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-sans flex items-center gap-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-semibold text-white">Encrypted Administrative Infrastructure</p>
              <p className="text-[11px] text-white/70">Multi-layer JWT session authorization & blue-ribbon audit logging.</p>
            </div>
          </div>
        </div>

        {/* Bottom Provenance Footnote */}
        <div className="relative z-10 text-[11px] font-sans text-white/60">
          © {new Date().getFullYear()} Duck Cosmetics Inc. Internal Systems.
        </div>
      </div>

      {/* RIGHT COLUMN: Luxury Login Card Container */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
        {/* Top Return Navigation Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          <div className="lg:hidden">
            <Link href="/" aria-label="Duck Cosmetics Storefront">
              <DuckLogo variant="purple" className="h-9 w-auto max-w-[140px]" />
            </Link>
          </div>
          <Link
            href="/"
            className="text-xs font-sans font-semibold text-text-gray hover:text-primary transition duration-200 inline-flex items-center gap-1.5 ml-auto group"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
            <span>Return to Public Atelier</span>
          </Link>
        </div>

        {/* Main Floating Luxury White Card */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(93,58,122,0.08)] border border-lilac-border relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

            {/* Card Header with High-Res Brand Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <DuckLogo variant="purple" className="h-11 sm:h-12 w-auto max-w-[170px]" priority />
              </div>
              <h1 className="font-serif text-3xl font-bold text-text-dark tracking-tight">
                Admin Portal
              </h1>
              <p className="mt-1.5 font-sans text-xs text-text-gray leading-relaxed">
                Enter your administrative credentials to manage catalog formulas, inventory, and order dispatch.
              </p>
            </div>

            {/* Error Alert Box */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              {/* Email Address Field */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5"
                >
                  Administrative Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@duckcosmetics.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50/90 border border-gray-200 text-xs sm:text-sm font-sans text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition duration-200"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-text-dark"
                  >
                    Executive Password
                  </label>
                  <span className="text-[11px] text-text-muted">256-bit AES</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-gray-50/90 border border-gray-200 text-xs sm:text-sm font-sans text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition duration-200"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Deep Purple Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary hover:bg-[#4A2D61] text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 shadow-md shadow-primary/20 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In To Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Footer within Card */}
            <div className="mt-8 pt-5 border-t border-gray-100 text-center">
              <p className="text-[11px] text-text-muted font-sans flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Duck Cosmetics Atelier Operations Management</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="w-full max-w-md mx-auto text-center text-[11px] text-text-muted font-sans">
          Authorized personnel only. All access attempts are cryptographically verified and logged.
        </div>
      </div>
    </div>
  );
}
