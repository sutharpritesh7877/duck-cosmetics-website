"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Sparkles, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DuckLogo } from "@/components/ui/DuckLogo";
import { useToast } from "@/components/ui/Toast";
import { ContactSettingsData, SiteSettingsData } from "@/lib/db";

interface ContactClientProps {
  contact: ContactSettingsData;
  settings: SiteSettingsData;
}

export function ContactClient({ contact, settings }: ContactClientProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toastError("Please fill out your name, email, and message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver message");
      }

      setSubmitted(true);
      toastSuccess("Your inquiry has been received. Our concierge desk will reply shortly.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      toastError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar text={settings.announcementBarText} />

      {/* Sticky Header */}
      <Header />

      <main className="flex-1 py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-lilac/30 to-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Page Heading */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lilac border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Haute Client Concierge</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-dark tracking-tight">
              CONNECT WITH OUR ATELIER
            </h1>
            <p className="mt-4 font-sans text-sm sm:text-base text-text-gray leading-relaxed">
              Whether reserving private pre-launch formulations, inquiring about wholesale partnerships, or consulting with our skin specialists — we are at your service.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left 5 Cols: Deep Purple Contact Card (Matches Screenshot & Spec) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 rounded-3xl bg-primary text-white p-8 sm:p-10 shadow-2xl border border-primary-hover flex flex-col justify-between relative overflow-hidden"
            >
              {/* Background Ambient Radiance */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-light/30 blur-2xl pointer-events-none" />

              <div>
                {/* Brand Seal */}
                <div className="flex items-center justify-between pb-8 border-b border-white/15">
                  <div className="bg-white px-3.5 py-1.5 rounded-2xl shadow-xs inline-flex items-center">
                    <DuckLogo className="h-8 w-auto max-w-[140px]" priority />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full text-white/90 font-sans">
                    Concierge Desk
                  </span>
                </div>

                {/* Contact Data Items */}
                <div className="mt-8 space-y-7">
                  {/* Call Section (3 Phone Numbers) */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70 font-sans">
                        Telephone Concierge
                      </h2>
                      <div className="mt-1.5 space-y-1 font-sans text-sm text-white">
                        <a href={`tel:${contact.phone1}`} className="block hover:underline">
                          {contact.phone1}
                        </a>
                        <a href={`tel:${contact.phone2}`} className="block hover:underline">
                          {contact.phone2}
                        </a>
                        <a href={`tel:${contact.phone3}`} className="block hover:underline text-white/90">
                          {contact.phone3}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email Section */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70 font-sans">
                        Private Inquiries & Press
                      </h2>
                      <div className="mt-1.5 font-sans text-sm">
                        <a
                          href={`mailto:${contact.email}`}
                          className="hover:underline text-white font-medium"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Visit Section (Full Ahmedabad Address) */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/70 font-sans">
                        Maison & Research Atelier
                      </h2>
                      <p className="mt-1.5 font-sans text-xs sm:text-sm text-white/90 leading-relaxed">
                        {contact.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Card Text (Exact Spec: "Duck Cosmetics — Care for Every Little Moment.") */}
              <div className="pt-10 mt-8 border-t border-white/15">
                <p className="font-serif text-lg sm:text-xl font-normal italic text-white/95 leading-snug">
                  "{contact.bottomText || "Duck Cosmetics — Care for Every Little Moment."}"
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/60 font-sans">
                  <Clock className="w-3.5 h-3.5 text-lilac" />
                  <span>Mon – Sat: 9:00 AM – 7:00 PM IST · Sunday by Private Appointment</span>
                </div>
              </div>
            </motion.div>

            {/* Right 7 Cols: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-lilac-border flex flex-col justify-between"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-text-dark">
                  Send a Direct Message
                </h2>
                <p className="font-sans text-xs sm:text-sm text-text-gray mt-2">
                  Our private client advisory desk typically responds within 4 business hours.
                </p>

                {submitted ? (
                  <div className="my-10 p-8 rounded-2xl bg-lilac/70 border border-lilac-border text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-text-dark">
                      Message Dispatched
                    </h3>
                    <p className="font-sans text-xs text-text-gray max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Duck Cosmetics. Your message has been logged in our central client management system.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-6 py-2.5 rounded-full border border-primary text-primary text-xs font-semibold uppercase tracking-wider hover:bg-lilac transition"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Charlotte Casiraghi"
                          className="w-full px-4 py-3.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. charlotte@couture.com"
                          className="w-full px-4 py-3.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                        Telephone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98250 00000"
                        className="w-full px-4 py-3.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                        Message & Inquiries *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please share how our concierge desk can assist you with formulas, allocations, or partnerships..."
                        className="w-full px-4 py-3.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-4 px-8 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/10 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Transmit Message to Atelier</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-text-muted font-sans">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Confidential Client Privileges Protected</span>
                </span>
                <span>Duck Cosmetics Atelier · Ahmedabad</span>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
