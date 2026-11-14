import React from "react";
import Link from "next/link";
import { DuckLogo } from "@/components/ui/DuckLogo";
import { Sparkles, ArrowLeft, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white">
      <Header />

      <main className="flex-grow flex items-center justify-center py-20 px-5 sm:px-8">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F8F6FA] border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Duck Atelier Client Concierge</span>
          </div>

          <div className="mb-6 flex justify-center">
            <DuckLogo className="h-12 w-auto max-w-[180px]" priority />
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-text-dark tracking-tight">
            404
          </h1>

          <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-primary font-medium">
            Oops! This page has flown away.
          </h2>

          <p className="mt-4 font-sans text-sm sm:text-base text-text-gray leading-relaxed max-w-md mx-auto">
            The formulation or page you are seeking cannot be located in our catalog. It may have been relocated, archived, or is being handcrafted for an upcoming drop.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-primary text-white font-sans text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-primary-hover hover:scale-[1.02] shadow-sm shadow-primary/25 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Link>

            <Link
              href="/shop"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#F8F6FA] text-text-dark border border-lilac-border font-sans text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-lilac hover:text-primary flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Collections</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}