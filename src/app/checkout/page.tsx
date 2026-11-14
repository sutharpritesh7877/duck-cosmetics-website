"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Truck,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Banknote,
  Tag,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/components/ui/Toast";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, freeShippingThreshold } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "STRIPE" | "COD">("RAZORPAY");

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState("");
  const [promoError, setPromoError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 120;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const clean = promoCode.trim().toUpperCase();

    if (clean === "DUCKVIP15" || clean === "VIP15") {
      setDiscountPercent(15);
      setPromoApplied(clean);
      toastSuccess("15% VIP inaugural discount applied!");
    } else if (clean === "GLOW10") {
      setDiscountPercent(10);
      setPromoApplied(clean);
      toastSuccess("10% Glow discount applied!");
    } else {
      setPromoError("Invalid promotional code. Please try DUCKVIP15.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");

    if (!fullName || !email || !phone || !address || !city || !pincode) {
      setOrderError("Please complete all required shipping details.");
      return;
    }

    if (items.length === 0) {
      setOrderError("Your shopping bag is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: fullName,
        email,
        phone,
        address: `${address}, ${city}, ${stateName} - ${pincode}, ${country}`,
        city,
        pincode,
        totalAmount,
        paymentMethod: paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod === "RAZORPAY" ? "Razorpay UPI / Cards" : "Stripe Global",
        notes: promoApplied ? `Promo Applied: ${promoApplied} (${discountPercent}% OFF)` : "Online Checkout Order",
        items: items.map((i) => ({
          productId: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrderError(data.error || "Order submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const orderId = data.order?.id || `ORD-${Date.now().toString().slice(-6)}`;
      clearCart();
      toastSuccess(`Ritual Order ${orderId} confirmed! Dispatched from Ahmedabad atelier.`);
      router.push(`/track-order?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`);
    } catch {
      setOrderError("Network error while submitting your order. Please retry.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <main className="max-w-2xl mx-auto px-5 py-24 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-lilac flex items-center justify-center text-primary/70 mx-auto border border-lilac-border">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-text-dark">
              Your beauty ritual awaits.
            </h1>
            <p className="font-sans text-sm text-text-gray max-w-md mx-auto leading-relaxed">
              You do not have any formulations allocated in your bag yet. Explore our haute catalog to curate your bespoke glow.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFE] flex flex-col justify-between selection:bg-primary selection:text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 w-full">
        <div className="mb-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Secure Atelier Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark mt-1">
            Complete Your Ritual Allocation
          </h1>
        </div>

        {orderError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{orderError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Customer & Delivery Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8 font-sans">
            {/* 1. Contact Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-serif text-lg font-bold text-text-dark flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans">
                    1
                  </span>
                  <span>Client Contact</span>
                </h2>
                <span className="text-[11px] text-text-muted">Order confirmation will be sent here</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Lady Eleanor Vance"
                    className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
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
                    placeholder="eleanor@hauteluxury.com"
                    className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Mobile Phone (For Express Courier Tracking) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 10194"
                    className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-serif text-lg font-bold text-text-dark flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans">
                    2
                  </span>
                  <span>Atelier Delivery Destination</span>
                </h2>
                <span className="text-[11px] text-text-muted">Direct from Ahmedabad Maison</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Street Address & Apartment / Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Penthouse 4B, Kensington Court, Bodakdev"
                    className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ahmedabad"
                      className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                      State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Gujarat"
                      className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="380054"
                      className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary transition"
                  >
                    <option value="India">India (Pan-India Express Dispatch)</option>
                    <option value="United States">United States (DHL International)</option>
                    <option value="United Kingdom">United Kingdom (DHL International)</option>
                    <option value="United Arab Emirates">United Arab Emirates (FedEx Priority)</option>
                    <option value="Singapore">Singapore (Express Airmail)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-serif text-lg font-bold text-text-dark flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-sans">
                    3
                  </span>
                  <span>Payment Gateway</span>
                </h2>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "RAZORPAY"
                      ? "border-primary bg-lilac/40 ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-text-dark block">
                        Razorpay (UPI, Google Pay, NetBanking, Cards)
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Zero transaction fees for all Indian domestic bank accounts
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-primary" />
                </label>

                {/* Stripe Global Option */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "STRIPE"
                      ? "border-primary bg-lilac/40 ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-text-dark block">
                        Stripe International (Visa, Mastercard, Amex, Apple Pay)
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Global credit and debit cards processed in USD ($)
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-primary" />
                </label>

                {/* Cash on Delivery Option */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "COD"
                      ? "border-primary bg-lilac/40 ring-1 ring-primary"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-text-dark block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Pay upon doorstep arrival (Available across all Pan-India pin codes)
                      </span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-primary" />
                </label>
              </div>
            </div>

            {/* Submit Button on Mobile */}
            <div className="block lg:hidden">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-primary text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Order Allocation · {formatPrice(totalAmount)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary & Trust Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6 font-sans">
              <h2 className="font-serif text-lg font-bold text-text-dark pb-4 border-b border-gray-100 flex items-center justify-between">
                <span>Ritual Summary</span>
                <span className="text-xs font-sans font-semibold text-text-muted">
                  {items.length} Formula{items.length === 1 ? "" : "s"}
                </span>
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={`checkout-${item.id}`} className="pt-3 first:pt-0 flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-lilac/40 shrink-0 border border-gray-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-bold text-text-dark truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-text-muted">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-text-dark shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Try code: DUCKVIP15"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs uppercase tracking-wider text-text-dark focus:bg-white focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 rounded-xl bg-lilac text-primary text-xs font-bold uppercase tracking-wider hover:bg-lilac-border transition shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                    {promoError}
                  </span>
                )}
                {promoApplied && (
                  <span className="text-[11px] text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Promo {promoApplied} Active ({discountPercent}% Savings)</span>
                  </span>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-4 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-text-gray">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-dark">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>VIP Inaugural Discount ({discountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-gray">
                  <span>Atelier Express Courier Dispatch</span>
                  <span className="font-semibold text-text-dark">
                    {shippingCost === 0 ? "Complimentary (₹0)" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-text-muted">
                  <span>Estimated Taxes (18% GST Included)</span>
                  <span>Inclusive</span>
                </div>
                <div className="flex justify-between text-base font-bold text-text-dark pt-3 border-t border-gray-200">
                  <span>Final Total</span>
                  <span className="text-primary text-xl font-serif">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit Button on Desktop */}
              <div className="hidden lg:block pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-lg shadow-primary/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Order Allocation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs space-y-3.5 font-sans">
              <div className="flex items-center gap-3 text-xs text-text-dark">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span><strong>256-Bit SSL Encrypted</strong> — Bank-grade cryptographic checkout</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-dark">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span><strong>Ahmedabad Atelier Dispatch</strong> — 3–5 day pan-India insured transit</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-dark">
                <HeartHandshake className="w-4 h-4 text-primary shrink-0" />
                <span><strong>14-Day Complimentary Returns</strong> — Guaranteed satisfaction policy</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
