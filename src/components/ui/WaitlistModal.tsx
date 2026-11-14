"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { useToast } from "./Toast";
import { DuckLogo } from "./DuckLogo";

const emailSchema = z.string().trim().email("Please enter a valid email address");

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  source?: string;
}

export function WaitlistModal({
  isOpen,
  onClose,
  productTitle,
  source = "Hero CTA",
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setErrorMessage("");
      setEmail("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      const msg = validation.error.issues?.[0]?.message || "Invalid email";
      setErrorMessage(msg);
      toastError(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: validation.data,
          source: productTitle ? `Product Modal: ${productTitle}` : source,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.error || "Unable to join waitlist. Please try again.";
        setErrorMessage(msg);
        toastError(msg);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      toastSuccess("You're on the list! Welcome to the Duck VIP circle.");
    } catch (err: any) {
      const msg = "Network error. Please check your connection and try again.";
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-3xl bg-white p-7 sm:p-10 shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-light to-primary" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-text-gray hover:text-text-dark hover:bg-lilac transition duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <DuckLogo variant="purple" className="h-8 w-24" />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lilac border border-lilac-border text-[11px] font-semibold tracking-wider text-primary uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>VIP Pre-Launch</span>
                  </span>
                </div>

                <h2
                  id="waitlist-modal-title"
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-text-dark leading-tight"
                >
                  {productTitle ? (
                    <>
                      Be the first to know when <span className="italic font-medium">{productTitle}</span> drops.
                    </>
                  ) : (
                    <>
                      Be the first to experience <span className="italic font-medium">Duck Cosmetics</span>.
                    </>
                  )}
                </h2>

                <p className="mt-3 font-sans text-xs sm:text-sm text-text-gray leading-relaxed">
                  Join our private guestlist for priority pre-order access, bespoke launch formulas, and complimentary global shipping on your debut order.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  <div>
                    <label htmlFor="waitlist-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="Enter your email (e.g. grace@couture.com)"
                      className="w-full px-5 py-4 rounded-xl bg-lilac border border-gray-200 text-sm font-sans text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white transition duration-200"
                      disabled={loading}
                    />
                    {errorMessage && (
                      <p className="mt-2 text-xs font-medium text-rose-600 pl-1">
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-white font-sans text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors duration-300 hover:bg-primary-hover disabled:opacity-60 shadow-md shadow-primary/10"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Reserving your invitation...
                      </span>
                    ) : (
                      <>
                        <span>Join The VIP Waitlist</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-text-muted font-sans">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    Strictly 0% Spam. Unsubscribe anytime.
                  </span>
                  <span>100% Cruelty-Free</span>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary mb-5 shadow-inner">
                  <Check className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-serif text-3xl font-normal text-text-dark">
                  You're on the list!
                </h3>

                <p className="mt-3 font-sans text-sm text-text-gray max-w-sm mx-auto leading-relaxed">
                  Thank you for joining Duck Cosmetics. We've reserved your priority allocation for{" "}
                  <strong className="text-text-dark font-semibold">{productTitle || "the official launch"}</strong>. Watch your inbox for private previews.
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3.5 px-6 rounded-xl border border-primary text-primary font-sans text-xs font-semibold tracking-wider uppercase hover:bg-lilac transition duration-200"
                  >
                    Continue Exploring
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
