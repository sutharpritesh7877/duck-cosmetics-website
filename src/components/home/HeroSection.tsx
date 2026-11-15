"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  imageUrl?: string;
  onOpenWaitlist: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function HeroSection({
  headline = "REDEFINE YOUR GLOW",
  subheadline = "Unveiling premium, playful & sophisticated beauty. Consciously formulated botanicals engineered for radiant, effortless luminescence.",
  imageUrl,
  onOpenWaitlist,
}: HeroSectionProps) {
  const displayImageUrl =
    imageUrl && imageUrl.trim()
      ? imageUrl.trim()
      : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop";
  return (
    <section className="relative w-full overflow-hidden bg-white py-16 sm:py-20 lg:py-24 border-b border-gray-100">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-lilac-subtle/80 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-lilac/90 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-center">
          {/* Left Column: Symmetrically padded & perfectly vertically centered */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center space-y-5 sm:space-y-6"
          >
            {/* VIP Pre-launch Pill */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lilac border border-lilac-border text-[11px] sm:text-xs font-semibold tracking-[0.16em] text-primary uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Pre-Launch Exclusive</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span className="text-text-muted">Spring 2026 Collection</span>
              </span>
            </motion.div>

            {/* Massive Editorial Serif Headline with staggered reveal */}
            <motion.h1
              variants={itemVariants}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[3.85rem] xl:text-[4.25rem] font-normal tracking-tight text-text-dark leading-[1.08]"
            >
              {headline.split(" ").map((word, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <span key={idx} className={isLast ? "italic font-normal text-primary" : ""}>
                    {word}{" "}
                  </span>
                );
              })}
            </motion.h1>

            {/* Subheadline: Perfectly balanced gap & high-readability leading-relaxed */}
            <motion.p
              variants={itemVariants}
              className="font-sans text-base sm:text-lg text-text-gray max-w-xl leading-relaxed sm:leading-[1.75] font-normal"
            >
              {subheadline}
            </motion.p>

            {/* Action CTA Group with smooth hover scaling */}
            <motion.div
              variants={itemVariants}
              className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <motion.button
                type="button"
                onClick={onOpenWaitlist}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-4.5 rounded-full bg-primary text-white font-sans text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase transition-all duration-300 hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                <span>JOIN THE WAITLIST</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>

              <motion.a
                href="#products"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="inline-flex items-center justify-center px-6 py-4 rounded-full border border-gray-200 text-text-dark font-sans text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase hover:bg-lilac transition duration-200 text-center"
              >
                Explore Preview
              </motion.a>
            </motion.div>

            {/* Trust Badges: 100% Cruelty-Free & Dermatologically Tested */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-sans font-semibold tracking-wider text-text-dark/90"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary shrink-0">
                  <HeartHandshake className="w-4 h-4 text-primary" />
                </span>
                <span className="uppercase text-[11px] sm:text-xs">
                  100% CRUELTY-FREE
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </span>
                <span className="uppercase text-[11px] sm:text-xs">
                  DERMATOLOGICALLY TESTED
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Editorial Model Image perfectly aligned horizontally */}
          <div className="relative flex items-center justify-center">
            {/* Soft Lilac Card Framing with scale-in reveal */}
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1.0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full mx-auto max-w-lg lg:max-w-none rounded-3xl overflow-hidden bg-lilac p-3 sm:p-4 border border-lilac-border shadow-xl shadow-primary/5"
            >
              <div className="relative aspect-[4/5] sm:aspect-[4/5] w-full rounded-2xl overflow-hidden bg-lilac-subtle">
                <Image
                  src={displayImageUrl}
                  alt="Duck Cosmetics Model showcasing radiant, glowing skin with luminous botanicals"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />

                {/* Editorial Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Product Card with Continuous Infinite Float Animation */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-serif text-sm font-semibold text-text-dark">
                      Duck Silk Glow Cushion
                    </p>
                    <p className="font-sans text-[11px] text-text-gray">
                      Formula 01 · Private Drop Allocation
                    </p>
                  </div>
                  <button
                    onClick={onOpenWaitlist}
                    className="px-3.5 py-1.5 rounded-full bg-primary text-white text-[10px] font-sans font-bold tracking-wider uppercase hover:bg-primary-hover transition"
                  >
                    Reserve
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Social Proof Badge with Delayed Entrance Notification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hidden sm:flex absolute -bottom-4 left-4 sm:left-6 z-20 items-center gap-2 px-4 py-2 rounded-full bg-white border border-lilac-border shadow-md text-xs font-sans text-text-dark"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Clean Formulas · 1,400+ on waitlist</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
