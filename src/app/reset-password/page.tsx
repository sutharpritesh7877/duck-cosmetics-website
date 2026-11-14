"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Shield, Sparkles } from "lucide-react";
import { DuckLogo } from "@/components/ui/DuckLogo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token || !email) {
      setErrorMsg("Invalid or missing reset token. Please request a new password reset email.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg("Password must contain at least one uppercase letter (A-Z).");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorMsg("Password must contain at least one numeric digit (0-9).");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to reset password. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMsg("A network error occurred. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-lilac-border shadow-xl text-center font-sans space-y-5">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-text-dark">Invalid Reset Link</h2>
        <p className="text-xs text-text-gray leading-relaxed">
          The password reset token is missing or malformed. For your security, reset links expire after 15 minutes.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-lilac-border shadow-xl text-center font-sans space-y-6">
        <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-text-dark">
            Password Reset Complete
          </h2>
          <p className="text-xs text-text-gray leading-relaxed">
            Your VIP security credentials have been successfully updated. You may now sign in to your Duck Cosmetics account.
          </p>
        </div>
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/20"
        >
          <span>Return to Boutique</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-lilac-border shadow-xl font-sans">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <DuckLogo className="h-10 sm:h-12 w-auto max-w-[150px]" priority />
        </div>
        <h1 className="font-serif text-2xl font-bold text-text-dark">
          Reset Your Password
        </h1>
        <p className="text-xs text-text-gray mt-1">
          Creating new VIP security credentials for: <span className="font-semibold text-text-dark">{email}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-lilac/50 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white transition"
            />
          </div>
          <span className="block text-[10px] text-text-muted mt-1">
            Minimum 8 characters with at least one uppercase letter (A-Z) and one number (0-9).
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-lilac/50 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/20 disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Save & Update Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
        <Shield className="w-3.5 h-3.5 text-primary" />
        <span>Strict 256-bit AES Cryptographic Security</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-lilac/30 flex flex-col justify-between">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Suspense
          fallback={
            <div className="text-center p-8">
              <span className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin inline-block" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
