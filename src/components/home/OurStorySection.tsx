"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Leaf, Award, Heart } from "lucide-react";

interface OurStorySectionProps {
  onOpenWaitlist?: () => void;
}

export function OurStorySection({ onOpenWaitlist }: OurStorySectionProps) {
  return (
    <section id="our-story" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual collage */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] w-full max-w-lg mx-auto rounded-3xl overflow-hidden bg-lilac p-3 border border-lilac-border shadow-xl">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=1000&auto=format&fit=crop"
                  alt="Duck Cosmetics Formulation Lab & Botanical Extraction"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="font-serif text-2xl font-light">
                    The Art of Haute Skincare
                  </p>
                  <p className="font-sans text-xs text-white/80 mt-1">
                    Formulated in Grasse & Seoul · Handcrafted in small micro-batches
                  </p>
                </div>
              </div>
            </div>

            {/* Overlapping Pill */}
            <div className="hidden sm:block absolute -bottom-5 -right-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xl max-w-xs">
              <p className="font-serif text-2xl font-bold text-primary">0% Parabens</p>
              <p className="font-sans text-xs text-text-gray mt-1">
                Zero synthetic fragrances, microplastics, or animal testing. Ever.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lilac border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Our Maison</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-dark tracking-tight leading-tight">
              Sophisticated Science, <br />
              <span className="italic text-primary font-normal">Playful Radiance.</span>
            </h2>

            <p className="font-sans text-base text-text-gray leading-relaxed">
              Duck Cosmetics was founded on a singular obsession: to dismantle the boundary between uncompromising clinical dermatology and haute couture pleasure.
            </p>

            <p className="font-sans text-sm text-text-gray leading-relaxed">
              Each drop combines bio-fermented hyaluronic fractions, antioxidant-dense botanical stem cells, and light-refracting minerals. Designed to honor your natural skin texture while imbuing an ethereal, camera-ready luminosity.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="p-4 rounded-xl bg-lilac/70 border border-lilac-border">
                <Leaf className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-serif text-sm font-bold text-text-dark">Clean Flora</h4>
                <p className="font-sans text-[11px] text-text-gray mt-1">Cold-pressed organic botanicals</p>
              </div>

              <div className="p-4 rounded-xl bg-lilac/70 border border-lilac-border">
                <Award className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-serif text-sm font-bold text-text-dark">Clinical Efficacy</h4>
                <p className="font-sans text-[11px] text-text-gray mt-1">Dermatologist approved formulas</p>
              </div>

              <div className="p-4 rounded-xl bg-lilac/70 border border-lilac-border">
                <Heart className="w-5 h-5 text-primary mb-2" />
                <h4 className="font-serif text-sm font-bold text-text-dark">PETA Certified</h4>
                <p className="font-sans text-[11px] text-text-gray mt-1">100% Cruelty-free & vegan</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-wider uppercase text-primary hover:text-primary-hover border-b border-primary pb-1 transition duration-200"
              >
                Join the Private Pre-Launch Guestlist →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
