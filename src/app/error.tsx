"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { DuckLogo } from "@/components/ui/DuckLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js App Router caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-lilac/30 flex flex-col justify-between py-12 px-5 font-sans selection:bg-primary selection:text-white">
      <div className="max-w-md mx-auto w-full text-center pb-8">
        <Link href="/" className="inline-block">
          <DuckLogo className="h-10 w-auto max-w-[160px]" />
        </Link>
      </div>

      <div className="max-w-md mx-auto w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-lilac-border text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-text-dark">
            Beauty Ritual Momentarily Paused
          </h1>
          <p className="text-xs text-text-gray leading-relaxed">
            Our atelier encountered an unexpected condition while preparing this page. Our engineers have been alerted.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-lilac text-text-dark text-xs font-semibold uppercase tracking-wider hover:bg-lilac-border transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-text-muted">
        <span>Duck Cosmetics Atelier · 24/7 Client Concierge</span>
      </div>
    </div>
  );
}
