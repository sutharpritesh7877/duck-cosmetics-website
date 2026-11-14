"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Send,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AccountSupportPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("duck_customer");
      if (stored) {
        const parsed = JSON.parse(stored);
        setForm((prev) => ({
          ...prev,
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
        }));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toastError("Please fill out your name, email, and inquiry.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess("Inquiry dispatched to our atelier concierge. We will respond within 4 hours.");
        setForm((prev) => ({ ...prev, message: "" }));
      } else {
        toastError(data.error || "Failed to submit inquiry.");
      }
    } catch {
      toastError("Network error while submitting inquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-text-dark font-normal">
          Concierge & Client Support
        </h2>
        <p className="text-xs sm:text-sm text-text-gray mt-1">
          Our Maison Concierge is at your service 24/7 for bespoke formulation consultations, dispatch inquiries, and VIP allocation assistance.
        </p>
      </div>

      {/* Instant Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* WhatsApp Direct */}
        <a
          href="https://wa.me/919825010194?text=Bonjour%20Duck%20Cosmetics%2C%20I%20am%20an%20authenticated%20VIP%20client%20requesting%20assistance."
          target="_blank"
          rel="noopener noreferrer"
          className="group p-5 rounded-3xl bg-[#F8F6FA] border border-lilac-border hover:border-emerald-500/40 hover:bg-white hover:shadow-md transition duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-text-dark">
              WhatsApp Concierge
            </h4>
            <p className="text-xs text-text-gray mt-1 leading-relaxed">
              Instant responses from dedicated atelier specialists.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-lilac-border/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <span>Open WhatsApp Chat</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* Email Atelier */}
        <a
          href="mailto:crm@duckcosmetics.in?subject=VIP%20Client%20Inquiry%20from%20Account%20Dashboard"
          className="group p-5 rounded-3xl bg-[#F8F6FA] border border-lilac-border hover:border-primary/40 hover:bg-white hover:shadow-md transition duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-text-dark">
              Email Concierge
            </h4>
            <p className="text-xs text-text-gray mt-1 leading-relaxed">
              crm@duckcosmetics.in
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-lilac-border/60 flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Send Email</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>

        {/* Telephone Concierge */}
        <a
          href="tel:+917940018899"
          className="group p-5 rounded-3xl bg-[#F8F6FA] border border-lilac-border hover:border-amber-500/40 hover:bg-white hover:shadow-md transition duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-text-dark">
              Telephone Atelier
            </h4>
            <p className="text-xs text-text-gray mt-1 leading-relaxed">
              +91 79 4001 8899
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-lilac-border/60 flex items-center gap-1.5 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            <span>Call Concierge</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      </div>

      {/* Support Ticket Submission Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-lilac-border shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-lilac flex items-center justify-center text-primary">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-text-dark">
              Submit an Atelier Support Ticket
            </h3>
            <p className="text-xs text-text-muted">
              Directly routed to the Duck Cosmetics executive OMS ticketing system.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98250 12345"
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition max-w-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-dark uppercase tracking-wider mb-1.5">
              Your Inquiry or Order Requirement *
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Please describe your question regarding formulations, order adjustments, or bespoke requests..."
              className="w-full px-4 py-3 rounded-2xl bg-[#F8F6FA] border border-lilac-border text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition resize-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Priority handling for verified VIP accounts</span>
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm shadow-primary/20 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Sending..." : "Dispatch Ticket"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Atelier Headquarters Address */}
      <div className="p-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-text-muted">
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-dark block">Atelier Physical Headquarters</span>
            <span>Duck Cosmetics Private Limited · Level 4, Signature Towers, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054, India</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-primary" />
          <span>Monday–Saturday: 09:00–20:00 IST</span>
        </div>
      </div>
    </div>
  );
}
