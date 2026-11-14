"use client";

import React, { useState } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DuckLogo } from "../ui/DuckLogo";
import { Sparkles, Calendar, ChevronDown, ShieldCheck } from "lucide-react";

interface DynamicPageLayoutProps {
  title: string;
  content: string;
  updatedAt?: string;
  announcementBarText?: string;
  slug: string;
}

export function DynamicPageLayout({
  title,
  content,
  updatedAt,
  announcementBarText,
  slug,
}: DynamicPageLayoutProps) {
  const isFaq = slug === "faq";
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // If this is the FAQ page, parse questions and answers starting with ###
  const renderFaqAccordion = () => {
    const rawParts = content.split(/###\s+/).filter(Boolean);
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {rawParts.map((part, idx) => {
          const lines = part.split("\n");
          const question = lines[0]?.trim();
          const answer = lines.slice(1).join("\n").trim();
          const isOpen = openFaqIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-lilac-border overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-lilac/30 transition"
                aria-expanded={isOpen}
              >
                <span className="font-serif text-base sm:text-lg font-bold text-text-dark">
                  {question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="p-5 pt-0 border-t border-lilac-border/40 font-sans text-xs sm:text-sm text-text-gray leading-relaxed bg-lilac/10">
                  <p className="whitespace-pre-line mt-3">{answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white">
      {/* Announcement Bar */}
      <AnnouncementBar text={announcementBarText} />

      {/* Header */}
      <Header />

      {/* Page Hero */}
      <section className="bg-lilac/50 border-b border-gray-100 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Maison Dossier</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-dark tracking-tight">
            {title}
          </h1>

          {updatedAt && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted font-sans pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Effective Date:{" "}
                {new Date(updatedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Page Body */}
      <main className="flex-1 py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          {isFaq ? (
            renderFaqAccordion()
          ) : (
            <article className="prose prose-purple max-w-none font-sans text-text-gray text-sm sm:text-base leading-relaxed space-y-6">
              {content.split("\n\n").map((para, i) => {
                if (para.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="font-serif text-2xl sm:text-3xl font-bold text-text-dark pt-4 pb-1 border-b border-gray-100"
                    >
                      {para.replace("## ", "")}
                    </h2>
                  );
                }
                if (para.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="font-serif text-xl sm:text-2xl font-semibold text-text-dark pt-3"
                    >
                      {para.replace("### ", "")}
                    </h3>
                  );
                }
                if (para.startsWith("#### ")) {
                  return (
                    <h4
                      key={i}
                      className="font-sans text-sm font-bold uppercase tracking-wider text-primary pt-2"
                    >
                      {para.replace("#### ", "")}
                    </h4>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-line">
                    {para}
                  </p>
                );
              })}
            </article>
          )}

          {/* Bottom Security / Trust Mark */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted font-sans">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Duck Cosmetics Atelier · 100% Purity & Client Guarantee</span>
            </span>
            <span>Duck Cosmetics Atelier · Ahmedabad</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
