"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { DuckLogo } from "./DuckLogo";
import { useToast } from "./Toast";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: { name: string; email: string }) => void;
  promptAction?: string;
}

export function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  promptAction = "To continue with your order",
}: CustomerAuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // Listen for Google OAuth error query params and surface sleek red toast
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("authError") === "google" || params.get("error") === "OAuthSignin") {
        toastError("Google Sign-In failed. Please try again.");
      }
    }
  }, [toastError]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (mode === "forgot") {
      if (!email || !email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setForgotSent(true);
        toastSuccess("Reset instructions dispatched. Check your inbox.");
      } catch {
        setErrorMsg("Failed to dispatch reset email. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name || name.trim().length < 2) {
          setErrorMsg("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setErrorMsg("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMsg(data.error || "Account creation failed. Please try again.");
          return;
        }

        const customer = { name: data.user.name || name, email: data.user.email };
        localStorage.setItem("duck_customer", JSON.stringify(customer));
        toastSuccess("VIP Account created successfully! Welcome to Duck Cosmetics.");
        onSuccess(customer);
        onClose();
      } else {
        // Sign In
        const res = await fetch("/api/auth/customer-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorMsg(data.error || "Incorrect email or password.");
          return;
        }

        const customer = { name: data.user.name || email.split("@")[0], email: data.user.email };
        localStorage.setItem("duck_customer", JSON.stringify(customer));
        toastSuccess(`Welcome back, ${customer.name}!`);
        onSuccess(customer);
        onClose();
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. If Firebase Auth is configured, trigger the official Google account chooser popup
      if (isFirebaseConfigured() && auth) {
        try {
          const { signInWithPopup } = await import("firebase/auth");
          googleProvider.setCustomParameters({ prompt: "select_account" });
          const userCredential = await signInWithPopup(auth, googleProvider);
          const googleUser = userCredential.user;

          if (googleUser && googleUser.email) {
            const res = await fetch("/api/auth/oauth-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: googleUser.email,
                name: googleUser.displayName || googleUser.email.split("@")[0],
                image: googleUser.photoURL,
              }),
            });
            const data = await res.json();
            if (data.success && data.user) {
              try {
                localStorage.setItem("duck_customer_user", JSON.stringify(data.user));
              } catch {}
              onSuccess(data.user);
              toastSuccess(`Welcome, ${data.user.name}! Signed in with Google.`);
              onClose();
              window.location.reload();
              return;
            }
          }
        } catch (fbErr: any) {
          // If user deliberately closed the popup window, cancel silently without error toast
          if (fbErr?.code === "auth/popup-closed-by-user") {
            setLoading(false);
            return;
          }
          console.warn("Firebase Google popup fallback to NextAuth:", fbErr);
        }
      }

      // 2. NextAuth Google Provider flow
      const res = await signIn("google", { redirect: false, callbackUrl: window.location.href });
      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      if (res?.error) {
        toastError("Google Sign-In failed. Please try again.");
        setErrorMsg("Google Sign-In failed. Please try again or sign in with email.");
      }
    } catch (err: any) {
      console.error("Google sign in exception:", err);
      toastError("Google Sign-In failed. Please try again.");
      setErrorMsg("Google Sign-In failed. Please try again or sign in with email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-auth-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-100 z-10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-text-gray hover:text-text-dark hover:bg-lilac transition"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <DuckLogo className="h-10 sm:h-11 w-auto max-w-[150px]" priority />
            </div>
            <h2
              id="customer-auth-title"
              className="font-serif text-2xl font-bold text-text-dark"
            >
              {mode === "forgot"
                ? "Reset Your Password"
                : mode === "signin"
                ? "Sign In to Your Account"
                : "Join the VIP Circle"}
            </h2>
            <p className="font-sans text-xs text-text-gray mt-1">
              {mode === "forgot"
                ? "Enter your email to receive a secure 15-minute reset link."
                : `${promptAction}, please sign in or create an account.`}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only when not in forgot mode) */}
          {mode !== "forgot" ? (
            <div className="flex rounded-xl bg-lilac p-1 mb-5 font-sans text-xs font-semibold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                }}
                className={`flex-1 py-2.5 rounded-lg transition ${
                  mode === "signin"
                    ? "bg-white text-primary shadow-xs"
                    : "text-text-gray hover:text-text-dark"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                }}
                className={`flex-1 py-2.5 rounded-lg transition font-bold ${
                  mode === "signup"
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-dark hover:text-primary"
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setForgotSent(false);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-4 font-sans"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}

          {/* Sleek Inline Red Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD SUCCESS VIEW */}
          {mode === "forgot" && forgotSent ? (
            <div className="text-center py-4 space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-text-dark">
                  Instructions Dispatched
                </h3>
                <p className="text-xs text-text-gray leading-relaxed">
                  We have sent password reset instructions to{" "}
                  <strong className="text-text-dark">{email}</strong>. The reset link is strictly valid for 15 minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setForgotSent(false);
                }}
                className="w-full py-2.5 rounded-xl bg-lilac text-primary text-xs font-semibold uppercase tracking-wider hover:bg-lilac-border transition"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            /* AUTH FORM */
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Grace Kelly"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="grace@couture.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMsg("");
                        }}
                        className="text-[11px] font-medium text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/10 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "forgot"
                        ? "Send Reset Link"
                        : mode === "signin"
                        ? "Sign In & Continue"
                        : "Join & Continue"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Sign-In (When not in forgot mode) */}
          {mode !== "forgot" && (
            <div className="pt-2">
              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <span className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] uppercase font-semibold text-text-muted">or</span>
                <span className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold uppercase tracking-wider text-text-dark transition shadow-2xs hover:border-gray-300"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Security Assurance */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-text-muted font-sans">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>256-bit SSL Encrypted · 100% Privacy Protected</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
