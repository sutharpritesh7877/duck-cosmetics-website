"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShoppingBag,
  PackageCheck,
  Heart,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  ChevronRight,
  Truck,
  Eye,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface OverviewData {
  customer: {
    id: string;
    email: string;
    name: string;
    phone?: string;
  };
  vipStatus: {
    isVip: boolean;
    position: number;
    totalWaitlist: number;
    tier: string;
  };
  metrics: {
    ordersCount: number;
    wishlistCount: number;
    addressesCount: number;
  };
  latestOrder: any | null;
}

export default function AccountOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let isMounted = true;
    fetch("/api/account/overview")
      .then((res) => res.json())
      .then((resData) => {
        if (isMounted && resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.warn("Overview load error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const customerName = data?.customer.name || "VIP Connoisseur";
  const positionStr = data?.vipStatus.position
    ? `#${data.vipStatus.position.toLocaleString()}`
    : "#1,402";
  const totalWaitlistStr = data?.vipStatus.totalWaitlist
    ? data.vipStatus.totalWaitlist.toLocaleString()
    : "1,402";

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Welcome Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atelier Client Portal</span>
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-text-dark font-normal">
          Welcome back, <span className="font-bold text-primary">{customerName}</span>.
        </h2>
        <p className="text-xs sm:text-sm text-text-gray mt-1 leading-relaxed">
          Here is your personal overview of pre-launch reservations, past atelier dispatches, and private wishlist formulas.
        </p>
      </div>

      {/* 2. VIP Status Card (Prominent Luxury Deep Purple / Lilac Gradient Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5D3A7A] via-[#4A2D61] to-[#361E47] text-white p-6 sm:p-8 shadow-[0_20px_45px_rgba(93,58,122,0.22)] border border-primary/30">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -right-6 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pre-Launch VIP Access · Active</span>
            </div>

            <div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                You are {positionStr} on the VIP List
              </h3>
              <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-lg leading-relaxed">
                As a prioritized connoisseur out of {totalWaitlistStr} global beauty insiders, you are guaranteed private 48-hour pre-launch ordering access before public reveals.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/new-arrivals"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-primary text-xs font-bold uppercase tracking-wider hover:bg-lilac transition duration-200 shadow-md"
            >
              <span>Explore The Drop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="group p-5 rounded-2xl bg-[#F8F6FA] border border-lilac-border hover:border-primary/40 hover:bg-white hover:shadow-xs transition duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition shadow-2xs">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-text-dark mt-2">
            {loading ? "..." : data?.metrics.ordersCount || 0}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block group-hover:text-primary transition">
            View order history & invoices &rarr;
          </span>
        </Link>

        <Link
          href="/account/wishlist"
          className="group p-5 rounded-2xl bg-[#F8F6FA] border border-lilac-border hover:border-primary/40 hover:bg-white hover:shadow-xs transition duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Wishlist Formulas
            </span>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition shadow-2xs">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-text-dark mt-2">
            {loading ? "..." : data?.metrics.wishlistCount || 0}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block group-hover:text-primary transition">
            Saved beauty creations &rarr;
          </span>
        </Link>

        <Link
          href="/account/addresses"
          className="group p-5 rounded-2xl bg-[#F8F6FA] border border-lilac-border hover:border-primary/40 hover:bg-white hover:shadow-xs transition duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Saved Addresses
            </span>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition shadow-2xs">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-text-dark mt-2">
            {loading ? "..." : data?.metrics.addressesCount || 0}
          </div>
          <span className="text-[10px] text-text-muted mt-1 block group-hover:text-primary transition">
            Manage shipping addresses &rarr;
          </span>
        </Link>
      </div>

      {/* 4. Recent Order Snapshot */}
      <div className="p-6 rounded-3xl bg-white border border-lilac-border shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h4 className="font-serif text-lg font-bold text-text-dark">Recent Order Snapshot</h4>
            <p className="text-xs text-text-muted mt-0.5">Most recent atelier order and delivery tracking.</p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
          >
            <span>All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-text-muted">Loading your recent dispatch...</div>
        ) : data?.latestOrder ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F6FA] border border-lilac-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-text-dark">
                    Order #{data.latestOrder.orderNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    data.latestOrder.status === "DELIVERED"
                      ? "bg-emerald-100 text-emerald-800"
                      : data.latestOrder.status === "SHIPPED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {data.latestOrder.status}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  Placed on {new Date(data.latestOrder.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} · {data.latestOrder.items?.length || 1} Items · Total {formatPrice(data.latestOrder.totalAmount)}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/track-order?orderId=${encodeURIComponent(data.latestOrder.orderNumber)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Package</span>
                </Link>
              </div>
            </div>

            {/* Thumbnail preview */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {data.latestOrder.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-white p-2 rounded-xl border border-lilac-border shrink-0">
                  {item.imageUrl ? (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-lilac shrink-0">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>
                  ) : null}
                  <span className="font-medium text-text-dark truncate max-w-[150px]">{item.title}</span>
                  <span className="text-text-muted">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <ShoppingBag className="w-9 h-9 text-text-muted mx-auto mb-2 opacity-60" />
            <p className="font-serif text-base text-text-dark">No orders placed yet</p>
            <p className="text-xs text-text-gray mt-1 max-w-sm mx-auto">
              Your beauty ritual awaits. Once your first formula drops or manual reservation is confirmed, live tracking details will appear here.
            </p>
            <div className="mt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
              >
                <span>Browse Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 5. Quick Links & Concierge Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
              The Debut Collection
            </span>
            <h4 className="font-serif text-lg font-bold text-text-dark">
              Explore Our Most Coveted
            </h4>
            <p className="text-xs text-text-gray mt-1 leading-relaxed">
              Explore Kashmiri Mogra saffron, cold-pressed Kumkumadi nectars, and pediatrician-approved baby care.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-lilac-border/60">
            <Link
              href="/best-sellers"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              <span>View Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-1">
              24/7 Digital Concierge
            </span>
            <h4 className="font-serif text-lg font-bold text-text-dark">
              Have a Formulation Inquiry?
            </h4>
            <p className="text-xs text-text-gray mt-1 leading-relaxed">
              Our beauty concierge is available around the clock via instant AI Q&A or direct WhatsApp assistance.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-lilac-border/60">
            <Link
              href="/account/support"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
            >
              <span>Contact Atelier Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
