"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { z } from "zod";
import { useToast } from "../ui/Toast";
import { DuckLogo } from "../ui/DuckLogo";

// Custom Instagram SVG Icon
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Custom TikTok SVG Icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 0 0 0 9.17 5.62c2.72-1.48 3.51-4.39 3.51-7.21V8.12a8.21 8.21 0 0 0 4.77 1.52V6.69z" />
    </svg>
  );
}

const newsletterSchema = z.string().trim().email("Please enter a valid email address");

interface FooterProps {
  onOpenWaitlist?: () => void;
  tagline?: string;
}

export function Footer({ onOpenWaitlist, tagline }: FooterProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSchema.safeParse(email);
    if (!result.success) {
      toastError(result.error.issues?.[0]?.message || "Invalid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.data,
          source: "Footer Newsletter",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toastError(data.error || "Could not subscribe. Please try again.");
        return;
      }
      setSubscribed(true);
      toastSuccess("Welcome to Duck VIP Club! You're subscribed.");
      setEmail("");
    } catch {
      toastError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-[#F8F6FA] text-text-dark pt-20 pb-12 selection:bg-primary selection:text-white border-t border-lilac-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Top Section: Brand Statement & Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-10 pb-16 border-b border-lilac-border/80">
          {/* Brand Column (2 cols on LG) */}
          <div className="lg:col-span-2 space-y-5">
            {/* The exact original Deep Purple (#5D3A7A) logo rendered crisp on light background */}
            <DuckLogo className="h-11 sm:h-12 w-auto max-w-[180px]" />

            <p className="font-sans text-sm text-text-gray max-w-sm leading-relaxed">
              {tagline ||
                "Unveiling a new era of playful luxury and sophisticated skincare. 100% cruelty-free, dermatologically tested, and formulated with conscious botanical extracts."}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-lilac-border text-primary text-xs font-sans font-semibold tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Pre-Launch VIP Access
              </span>
            </div>
          </div>

          {/* Column 1: Shop Collections */}
          <div className="space-y-4">
            <h3 className="font-serif text-base tracking-[0.12em] font-semibold uppercase text-text-dark">
              Shop Collections
            </h3>
            <ul className="space-y-3 font-sans text-sm text-text-gray">
              <li>
                <Link href="/shop/baby-care" className="hover:text-primary transition duration-200">
                  Baby Care Collection
                </Link>
              </li>
              <li>
                <Link href="/shop/ayurvedic" className="hover:text-primary transition duration-200">
                  Ayurvedic Nectars
                </Link>
              </li>
              <li>
                <Link href="/shop/skincare" className="hover:text-primary transition duration-200">
                  Clinical Skincare
                </Link>
              </li>
              <li>
                <Link href="/shop/makeup" className="hover:text-primary transition duration-200">
                  Velvet Cushion Tints
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary transition duration-200">
                  Shop All Formulations
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenWaitlist}
                  className="hover:text-primary transition duration-200 text-left font-semibold text-primary underline underline-offset-4"
                >
                  Join VIP Waitlist
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: About Us & Editorial */}
          <div className="space-y-4">
            <h3 className="font-serif text-base tracking-[0.12em] font-semibold uppercase text-text-dark">
              About Us
            </h3>
            <ul className="space-y-3 font-sans text-sm text-text-gray">
              <li>
                <Link href="/about" className="hover:text-primary transition duration-200">
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition duration-200">
                  Cruelty-Free Pledge
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition duration-200">
                  Ayurvedic Fusion
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition duration-200">
                  FAQ Accordions
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-primary transition duration-200 font-medium">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition duration-200">
                  Contact & Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-serif text-base tracking-[0.12em] font-semibold uppercase text-text-dark">
              Newsletter
            </h3>
            <p className="font-sans text-xs text-text-gray leading-relaxed">
              Subscribe to receive private preview drops, botanical formulation secrets, and VIP launch invitations.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-white border border-lilac-border rounded-xl text-primary text-xs font-sans font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>You are subscribed to private drops!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-white border border-lilac-border text-text-dark placeholder:text-text-muted text-xs font-sans focus:outline-none focus:border-primary transition duration-200 shadow-2xs"
                    disabled={loading}
                    aria-label="Email for newsletter"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-primary text-white hover:bg-primary-hover transition duration-200 flex items-center justify-center disabled:opacity-60"
                    aria-label="Submit newsletter subscription"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <span className="block text-[11px] text-text-muted font-sans">
                  No spam. Only high-fashion beauty news.
                </span>
              </form>
            )}

            <div className="pt-2 text-xs font-sans text-text-gray space-y-1.5">
              <Link href="/track-order" className="hover:text-primary transition duration-200 inline-flex items-center gap-1 font-semibold text-primary">
                <span>Track Order Journey</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link href="/contact" className="hover:text-primary transition duration-200 block">
                Customer Care: concierge@duckcosmetics.com
              </Link>
              <p className="text-text-muted">Complimentary Global Shipping & Returns</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Policies, Admin Link & Social Icons */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-text-muted font-sans">
          <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Duck Cosmetics Inc. All rights reserved.</span>
            <span className="hidden sm:inline-block text-lilac-border">|</span>
            <Link href="/privacy" className="hover:text-primary transition duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition duration-200">
              Terms of Service
            </Link>
            <Link href="/returns" className="hover:text-primary transition duration-200">
              Refund Policy
            </Link>
            <Link href="/shipping" className="hover:text-primary transition duration-200">
              Shipping Policy
            </Link>
            <Link href="/track-order" className="hover:text-primary transition duration-200 font-medium">
              Track Order
            </Link>
            <span className="hidden sm:inline-block text-lilac-border">|</span>
            <Link href="/admin" className="text-text-muted/60 hover:text-primary transition duration-200">
              Admin Concierge
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-text-muted mr-1 hidden sm:inline-block">
              Follow Us
            </span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Duck Cosmetics on Instagram"
                className="p-2 rounded-full bg-white border border-lilac-border text-text-dark hover:text-primary hover:border-primary transition duration-200 shadow-2xs"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Duck Cosmetics on TikTok"
                className="p-2 rounded-full bg-white border border-lilac-border text-text-dark hover:text-primary hover:border-primary transition duration-200 shadow-2xs"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
    </footer>
  );
}