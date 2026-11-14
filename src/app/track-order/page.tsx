"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCurrency } from "@/context/CurrencyContext";

interface OrderTrackingData {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  address: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  carrier: string;
  trackingCode: string;
  estimatedDelivery: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  timeline: Array<{
    stage: number;
    title: string;
    description: string;
    timestamp: string;
    isCompleted: boolean;
    isActive: boolean;
  }>;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const initialEmail = searchParams.get("email") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const { formatPrice } = useCurrency();

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderId.trim()) {
      setErrorMsg("Please enter your Order ID.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Order not found. Please verify your order number.");
        setTrackingData(null);
      } else {
        setTrackingData(data.order);
      }
    } catch {
      setErrorMsg("Network error while looking up order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if parameters are pre-filled from checkout redirect
  useEffect(() => {
    if (initialOrderId) {
      handleTrack();
    }
  }, [initialOrderId]);

  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16 w-full font-sans">
      {/* Header Statement */}
      <div className="text-center max-w-xl mx-auto space-y-3 mb-10">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Real-Time Courier Dispatch
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark">
          Track Your Beauty Ritual Shipment
        </h1>
        <p className="text-xs text-text-gray leading-relaxed">
          Follow your luxury allocation from our Ahmedabad atelier to your doorstep with guaranteed chain-of-custody tracking.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs max-w-2xl mx-auto mb-12">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Order ID / Number *
              </label>
              <div className="relative">
                <Package className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-1001 or ORD-..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-lilac/30 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-lilac/30 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Shipment</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Tracking Results Card */}
      {trackingData && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Status Top Strip */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Order Reference
                </span>
                <h3 className="font-serif text-2xl font-bold text-text-dark">
                  {trackingData.id}
                </h3>
                <span className="text-xs text-text-gray">
                  Client: <strong className="text-text-dark">{trackingData.customerName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{trackingData.status}</span>
                </span>
              </div>
            </div>

            {/* Courier & ETA Quick Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-lilac/30 border border-lilac-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                  Carrier & Tracking Code
                </span>
                <span className="text-xs font-bold text-text-dark block mt-1">
                  {trackingData.carrier}
                </span>
                <span className="text-[11px] font-mono text-primary font-bold">
                  {trackingData.trackingCode}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-lilac/30 border border-lilac-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                  Estimated Doorstep Arrival
                </span>
                <span className="text-xs font-bold text-text-dark block mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{trackingData.estimatedDelivery}</span>
                </span>
                <span className="text-[11px] text-text-muted">Direct signature delivery</span>
              </div>

              <div className="p-4 rounded-2xl bg-lilac/30 border border-lilac-border">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                  Destination Address
                </span>
                <span className="text-xs text-text-dark line-clamp-2 mt-1">
                  {trackingData.address}
                </span>
              </div>
            </div>

            {/* Visual Shipment Timeline */}
            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-serif text-base font-bold text-text-dark mb-6">
                Shipment Journey Timeline
              </h4>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-lilac-border">
                {trackingData.timeline.map((step) => (
                  <div key={`stage-${step.stage}`} className="relative group">
                    {/* Step Icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition ${
                        step.isCompleted
                          ? "bg-primary text-white shadow-xs"
                          : "bg-white border-2 border-gray-200 text-text-muted"
                      }`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Clock className="w-3 h-3 text-text-muted" />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${step.isCompleted ? "text-text-dark" : "text-text-muted"}`}>
                          {step.title}
                        </span>
                        <span className="text-[11px] font-medium text-text-muted bg-gray-50 px-2 py-0.5 rounded-md">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-text-gray leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordered Items Preview */}
            {trackingData.items && trackingData.items.length > 0 && (
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <h4 className="font-serif text-base font-bold text-text-dark">
                  Allocated Formulations ({trackingData.items.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trackingData.items.map((it, idx) => (
                    <div
                      key={`item-${idx}`}
                      className="p-3 rounded-2xl bg-lilac/20 border border-gray-100 flex items-center gap-3"
                    >
                      {it.imageUrl && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100">
                          <Image src={it.imageUrl} alt="" fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-text-dark block truncate">
                          {it.title}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          Qty: {it.quantity} · {formatPrice(it.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Callout */}
            <div className="p-4 rounded-2xl bg-[#F8F6FA] border border-lilac-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-text-gray">
                Need immediate courier assistance or delivery rescheduling?
              </span>
              <a
                href="https://wa.me/919825010194?text=Hello%20Duck%20Cosmetics%20Concierge,%20I%20need%20assistance%20tracking%20my%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Atelier Support</span>
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col justify-between selection:bg-primary selection:text-white">
      <Header />
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-5 py-24 text-center">
            <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
          </div>
        }
      >
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </div>
  );
}
