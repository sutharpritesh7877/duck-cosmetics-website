"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, CheckCircle2, Shield, Tag, Gift } from "lucide-react";
import { DuckLogo } from "./DuckLogo";

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if user already dismissed the modal this session
    const dismissed = sessionStorage.getItem("duck_exit_intent_dismissed");
    if (dismissed) return;

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor moves towards the browser tab bar / address bar
      if (e.clientY <= 15 && !sessionStorage.getItem("duck_exit_intent_dismissed")) {
        setIsOpen(true);
        sessionStorage.setItem("duck_exit_intent_dismissed", "true");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    // Mobile fallback: show after 45 seconds of browsing
    timeoutId = setTimeout(() => {
      if (!sessionStorage.getItem("duck_exit_intent_dismissed")) {
        setIsOpen(true);
        sessionStorage.setItem("duck_exit_intent_dismissed", "true");
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("duck_exit_intent_dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "Exit-Intent VIP Allocation" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Unable to reserve allocation. Please retry.");
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Secure VIP Pre-Launch Access"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-lilac-border z-10 overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-2 rounded-full text-text-gray hover:text-text-dark hover:bg-lilac transition duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {success ? (
              /* Success View */
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    VIP Reservation Confirmed
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-text-dark">
                    Your Inaugural Perk is Unlocked
                  </h3>
                  <p className="text-xs text-text-gray max-w-sm mx-auto leading-relaxed">
                    We have reserved your pre-launch formula drop allocation. Use code below at checkout:
                  </p>
                </div>

                {/* Voucher Code Box */}
                <div className="p-4 rounded-2xl bg-lilac/50 border border-dashed border-primary/40 max-w-xs mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="font-mono text-base font-bold text-primary tracking-wider">
                      DUCKVIP15
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    15% OFF
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full py-3.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm"
                >
                  Continue Exploring Rituals
                </button>
              </div>
            ) : (
              /* Exit-Intent Offer View */
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-3">
                    <DuckLogo className="h-9 w-auto max-w-[140px]" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lilac border border-lilac-border text-primary text-[11px] font-bold uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Exclusive Pre-Launch Opportunity</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text-dark leading-snug">
                    Wait! Secure Your VIP Pre-Launch Access.
                  </h3>

                  <p className="text-xs text-text-gray max-w-sm mx-auto leading-relaxed">
                    Our initial small-batch drop has limited allocations. Enter your email to guarantee priority dispatch + unlock an instant <strong>15% VIP inaugural savings code</strong>.
                  </p>
                </div>

                {/* Offer Highlights */}
                <div className="grid grid-cols-2 gap-2.5 text-xs text-text-dark">
                  <div className="p-3 rounded-2xl bg-lilac/30 border border-lilac-border flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold">15% Off First Drop</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-lilac/30 border border-lilac-border flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[11px] font-semibold">Priority Batch Dispatch</span>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 text-center font-medium">
                    {errorMsg}
                  </p>
                )}

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your private email..."
                      className="w-full px-4 py-3.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark placeholder:text-text-muted focus:bg-white focus:outline-none focus:border-primary transition"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Claim 15% VIP Access</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Dismiss Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-[11px] text-text-muted hover:text-text-gray underline transition font-medium"
                  >
                    No thanks, I'll pay full price later
                  </button>
                </div>

                {/* Security Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-text-muted">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>100% Privacy Protected · Zero Spam Guarantee</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
