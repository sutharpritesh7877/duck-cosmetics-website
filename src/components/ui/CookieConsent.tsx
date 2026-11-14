"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, Check, X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("duck_cookie_consent");
      if (!consent) {
        // Small delay so page content renders smoothly first
        const timer = setTimeout(() => {
          setVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage blocked/unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("duck_cookie_consent", "accepted");
    } catch {}
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("duck_cookie_consent", "essential_only");
    } catch {}
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(93,58,122,0.18)] border border-lilac-border ring-1 ring-black/5 z-50 selection:bg-primary selection:text-white"
        >
          {/* Top Header Badge */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lilac text-primary text-[10px] font-semibold tracking-wider uppercase font-sans">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>International Privacy Compliance</span>
            </div>
            <button
              type="button"
              onClick={handleDecline}
              className="text-text-muted hover:text-text-dark p-1 rounded-md transition"
              aria-label="Close and use essential cookies only"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Text */}
          <h3 className="font-serif text-sm font-semibold text-text-dark mb-1">
            We value your digital privacy & discretion.
          </h3>
          <p className="font-sans text-xs text-text-gray leading-relaxed mb-4">
            Duck Cosmetics uses conscious telemetry and privacy-first cookies to curate personalized formulation journeys, protect transactional security, and uphold GDPR, CCPA, and IT Act standards. Read our{" "}
            <Link
              href="/privacy"
              className="text-primary font-medium underline underline-offset-2 hover:opacity-80"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              className="text-primary font-medium underline underline-offset-2 hover:opacity-80"
            >
              Terms of Service
            </Link>.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 font-sans">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-primary text-white text-xs font-semibold tracking-wide hover:bg-primary-hover transition shadow-sm shadow-primary/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
            <button
              type="button"
              onClick={handleDecline}
              className="py-2.5 px-3.5 rounded-xl border border-gray-200 bg-white text-text-dark text-xs font-medium hover:bg-lilac transition"
            >
              Essential Only
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
