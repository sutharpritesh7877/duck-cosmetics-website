"use client";

import React from "react";
import { Sparkles, HeartHandshake, ShieldCheck, Truck, Star } from "lucide-react";
import { motion } from "framer-motion";

interface AnnouncementBarProps {
  text?: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  const content = text || "Free Shipping Over ₹800 · 100% Cruelty-Free · PETA Certified Vegan";

  const marqueeItems = [
    { text: content, icon: Sparkles },
    { text: "Dermatologically & Pediatric Tested Formulations", icon: ShieldCheck },
    { text: "Ahmedabad Atelier · Express Global Dispatch", icon: Truck },
    { text: "Maison Concierge · 24/7 VIP Client Support", icon: HeartHandshake },
    { text: "Pre-Launch VIP Access · Reserve Your Allocation", icon: Star },
  ];

  return (
    <aside
      aria-label="Announcement"
      className="relative w-full h-9 sm:h-10 bg-primary text-white overflow-hidden select-none border-b border-white/10 flex items-center"
    >
      {/* Subtle fade-out masks on far left and right edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-primary via-primary/80 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full flex items-center whitespace-nowrap overflow-hidden px-4 sm:px-6">
        {/* Infinite Framer Motion Marquee Loop */}
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 32,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex items-center shrink-0 gap-10 sm:gap-14 text-[10px] sm:text-xs font-sans font-medium tracking-[0.18em] uppercase will-change-transform"
        >
          {/* Track 1 */}
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`t1-${idx}`} className="flex items-center gap-3">
                <Icon className="w-3 h-3 text-[#EADBF7] shrink-0" aria-hidden="true" />
                <span>{item.text}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
              </div>
            );
          })}

          {/* Track 2 (Duplicate for seamless loop) */}
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`t2-${idx}`} className="flex items-center gap-3">
                <Icon className="w-3 h-3 text-[#EADBF7] shrink-0" aria-hidden="true" />
                <span>{item.text}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </aside>
  );
}
