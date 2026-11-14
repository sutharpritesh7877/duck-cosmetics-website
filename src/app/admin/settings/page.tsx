"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Save,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PaymentGatewaysState {
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayTestMode: boolean;
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeTestMode: boolean;
  codEnabled: boolean;
  codMaxLimit: number;
  phonepeEnabled: boolean;
}

interface ShippingZonesState {
  domesticFreeThreshold: number;
  domesticFlatRate: number;
  domesticExpressRate: number;
  domesticCarrier: string;
  domesticTransitDays: string;
  internationalFreeThreshold: number;
  internationalFlatRate: number;
  internationalCarrier: string;
  internationalTransitDays: string;
}

interface GlobalRoutingState {
  baseCurrency: "INR" | "USD";
  usdToInrRate: number;
  autoDetectGeo: boolean;
  gstIncludedIndia: boolean;
  internationalCustomsNote: string;
  ayurvedicExportAllowed: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"payments" | "shipping" | "global">("payments");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const [globalRouting, setGlobalRouting] = useState<GlobalRoutingState>({
    baseCurrency: "INR",
    usdToInrRate: 83.0,
    autoDetectGeo: false,
    gstIncludedIndia: true,
    internationalCustomsNote: "International orders may be subject to local customs duties upon arrival.",
    ayurvedicExportAllowed: true,
  });

  const [payments, setPayments] = useState<PaymentGatewaysState>({
    razorpayEnabled: true,
    razorpayKeyId: "rzp_test_5D3A7A9991",
    razorpayKeySecret: "••••••••••••••••",
    razorpayTestMode: true,
    stripeEnabled: true,
    stripePublishableKey: "pk_test_51Pxxxxxxxxxxxxxxxx",
    stripeSecretKey: "••••••••••••••••",
    stripeTestMode: true,
    codEnabled: true,
    codMaxLimit: 5000,
    phonepeEnabled: false,
  });

  const [shipping, setShipping] = useState<ShippingZonesState>({
    domesticFreeThreshold: 800,
    domesticFlatRate: 99,
    domesticExpressRate: 199,
    domesticCarrier: "Delhivery Express / BlueDart",
    domesticTransitDays: "2-4 Business Days",
    internationalFreeThreshold: 1500,
    internationalFlatRate: 200,
    internationalCarrier: "DHL Express / FedEx International",
    internationalTransitDays: "5-10 Business Days",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.paymentGateways) {
          setPayments((prev) => ({ ...prev, ...data.settings.paymentGateways }));
        }
        if (data.settings.shippingZones) {
          setShipping((prev) => ({ ...prev, ...data.settings.shippingZones }));
        }
        if (data.settings.globalRouting) {
          setGlobalRouting((prev) => ({ ...prev, ...data.settings.globalRouting }));
        }
        if (data.settings.baseCurrency) {
          setGlobalRouting((prev) => ({ ...prev, baseCurrency: data.settings.baseCurrency }));
        }
      }
    } catch {
      toastError("Could not load payment & shipping configurations.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentGateways: payments,
          shippingZones: shipping,
          globalRouting: globalRouting,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess("Payment gateways, shipping zones & currency configurations updated successfully.");
      } else {
        toastError(data.error || "Failed to update configurations.");
      }
    } catch {
      toastError("Network error while saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Infrastructure & Backend Wiring
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-dark">
            Payment Gateways & Shipping Zones
          </h1>
          <p className="text-sm text-text-gray mt-1">
            Pre-configure your transactional gateways and geographic courier rates for launch day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold uppercase tracking-wider text-text-dark hover:bg-lilac transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm shadow-primary/20 disabled:opacity-60"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 font-sans text-xs font-semibold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition ${
            activeTab === "payments"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-gray hover:text-text-dark hover:border-gray-300"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateways (Razorpay & Stripe)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("shipping")}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition ${
            activeTab === "shipping"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-gray hover:text-text-dark hover:border-gray-300"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping Zones & Carrier Rates</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("global")}
          className={`flex items-center gap-2 py-3 px-6 border-b-2 transition ${
            activeTab === "global"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-text-gray hover:text-text-dark hover:border-gray-300"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Global Currency & Geo-Routing</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* TAB 1: PAYMENT GATEWAYS */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Razorpay Gateway */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0C2340] text-white flex items-center justify-center font-bold text-sm">
                    Rzp
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text-dark">
                      Razorpay Gateway (India & UPI)
                    </h3>
                    <p className="text-xs text-text-gray">
                      Enables UPI (GPay, PhonePe, Paytm), RuPay, Indian Netbanking, and Cards.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payments.razorpayTestMode}
                      onChange={(e) =>
                        setPayments({ ...payments, razorpayTestMode: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Sandbox Test Mode</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payments.razorpayEnabled}
                      onChange={(e) =>
                        setPayments({ ...payments, razorpayEnabled: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className={payments.razorpayEnabled ? "text-primary font-bold" : "text-text-muted"}>
                      {payments.razorpayEnabled ? "Gateway Active" : "Disabled"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Razorpay Key ID
                  </label>
                  <input
                    type="text"
                    value={payments.razorpayKeyId}
                    onChange={(e) =>
                      setPayments({ ...payments, razorpayKeyId: e.target.value })
                    }
                    placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/50 text-xs font-mono text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Razorpay Key Secret
                  </label>
                  <input
                    type="password"
                    value={payments.razorpayKeySecret}
                    onChange={(e) =>
                      setPayments({ ...payments, razorpayKeySecret: e.target.value })
                    }
                    placeholder="••••••••••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/50 text-xs font-mono text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Stripe Gateway */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center font-bold text-sm">
                    Str
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text-dark">
                      Stripe Gateway (International & Apple Pay)
                    </h3>
                    <p className="text-xs text-text-gray">
                      Accepts 135+ global currencies, Apple Pay, Google Pay, and international cards.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payments.stripeTestMode}
                      onChange={(e) =>
                        setPayments({ ...payments, stripeTestMode: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Stripe Test Mode</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payments.stripeEnabled}
                      onChange={(e) =>
                        setPayments({ ...payments, stripeEnabled: e.target.checked })
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className={payments.stripeEnabled ? "text-primary font-bold" : "text-text-muted"}>
                      {payments.stripeEnabled ? "Gateway Active" : "Disabled"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    value={payments.stripePublishableKey}
                    onChange={(e) =>
                      setPayments({ ...payments, stripePublishableKey: e.target.value })
                    }
                    placeholder="pk_live_xxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/50 text-xs font-mono text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    value={payments.stripeSecretKey}
                    onChange={(e) =>
                      setPayments({ ...payments, stripeSecretKey: e.target.value })
                    }
                    placeholder="sk_live_xxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/50 text-xs font-mono text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Offline & Alternative Payments */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
              <h3 className="font-serif text-lg font-bold text-text-dark">
                Cash on Delivery (COD) & Alternative Tenders
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-lilac/30">
                  <div>
                    <span className="block text-xs font-semibold text-text-dark uppercase tracking-wider">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-text-gray">
                      Allow customers in India to pay upon doorstep arrival
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={payments.codEnabled}
                    onChange={(e) => setPayments({ ...payments, codEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Maximum COD Order Cap (INR)
                  </label>
                  <input
                    type="number"
                    value={payments.codMaxLimit}
                    onChange={(e) =>
                      setPayments({ ...payments, codMaxLimit: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHIPPING ZONES & CARRIERS */}
        {activeTab === "shipping" && (
          <div className="space-y-6">
            {/* Zone 1: Domestic India */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  🇮🇳
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-dark">
                    Domestic Shipping Zone (India & Pan-Indian Territories)
                  </h3>
                  <p className="text-xs text-text-gray">
                    Fulfillment from Ahmedabad Atelier via Delhivery, BlueDart, DTDC.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Free Shipping Threshold (INR)
                  </label>
                  <input
                    type="number"
                    value={shipping.domesticFreeThreshold}
                    onChange={(e) =>
                      setShipping({ ...shipping, domesticFreeThreshold: Number(e.target.value) })
                    }
                    placeholder="800"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Standard Flat Rate (INR)
                  </label>
                  <input
                    type="number"
                    value={shipping.domesticFlatRate}
                    onChange={(e) =>
                      setShipping({ ...shipping, domesticFlatRate: Number(e.target.value) })
                    }
                    placeholder="99"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Express Overnight Rate (INR)
                  </label>
                  <input
                    type="number"
                    value={shipping.domesticExpressRate}
                    onChange={(e) =>
                      setShipping({ ...shipping, domesticExpressRate: Number(e.target.value) })
                    }
                    placeholder="199"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Integrated Domestic Carrier Partners
                  </label>
                  <input
                    type="text"
                    value={shipping.domesticCarrier}
                    onChange={(e) =>
                      setShipping({ ...shipping, domesticCarrier: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Published Domestic Delivery SLA
                  </label>
                  <input
                    type="text"
                    value={shipping.domesticTransitDays}
                    onChange={(e) =>
                      setShipping({ ...shipping, domesticTransitDays: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Zone 2: International Worldwide */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  🌍
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-dark">
                    International Shipping Zone (Worldwide Courier)
                  </h3>
                  <p className="text-xs text-text-gray">
                    Dispatched via DHL Express & FedEx International Priority.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    International Free Shipping Threshold (INR / ~$150 USD)
                  </label>
                  <input
                    type="number"
                    value={shipping.internationalFreeThreshold}
                    onChange={(e) =>
                      setShipping({ ...shipping, internationalFreeThreshold: Number(e.target.value) })
                    }
                    placeholder="1500"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Standard International Flat Rate (INR / ~$20 USD)
                  </label>
                  <input
                    type="number"
                    value={shipping.internationalFlatRate}
                    onChange={(e) =>
                      setShipping({ ...shipping, internationalFlatRate: Number(e.target.value) })
                    }
                    placeholder="200"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    International Express Carrier Partner
                  </label>
                  <input
                    type="text"
                    value={shipping.internationalCarrier}
                    onChange={(e) =>
                      setShipping({ ...shipping, internationalCarrier: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Published International Transit SLA
                  </label>
                  <input
                    type="text"
                    value={shipping.internationalTransitDays}
                    onChange={(e) =>
                      setShipping({ ...shipping, internationalTransitDays: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL CURRENCY & GEO-ROUTING */}
        {activeTab === "global" && (
          <div className="space-y-6">
            {/* Exchange Rate Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-dark">
                    Exchange Rate & Currency Conversion
                  </h3>
                  <p className="text-xs text-text-gray">
                    Define manual exchange rate overrides for real-time frontend conversion (INR ₹ $\leftrightarrow$ USD $).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Store Base Currency (Admin-Only Control)
                  </label>
                  <select
                    value={globalRouting.baseCurrency || "INR"}
                    onChange={(e) =>
                      setGlobalRouting({
                        ...globalRouting,
                        baseCurrency: e.target.value as "INR" | "USD",
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs font-semibold text-text-dark focus:bg-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="INR">INR (₹) — Indian Rupee (Default Store Currency)</option>
                    <option value="USD">USD ($) — United States Dollar</option>
                  </select>
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Public visitors will see all prices strictly in this currency. No public currency selectors are shown to visitors.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    Conversion Rate: 1 USD in INR (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalRouting.usdToInrRate}
                    onChange={(e) =>
                      setGlobalRouting({
                        ...globalRouting,
                        usdToInrRate: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-text-muted mt-1 block">
                    e.g. Setting 83.00 converts ₹1,199 into $14.45
                  </span>
                </div>
              </div>
            </div>

            {/* Regional Taxes & Customs */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-dark">
                    Regional Tax & Customs Notes
                  </h3>
                  <p className="text-xs text-text-gray">
                    GST tax display rules and international customs notifications.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-lilac/20">
                  <div>
                    <span className="block text-xs font-semibold text-text-dark uppercase tracking-wider">
                      Indian Prices Shown as GST-Inclusive
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Standard Indian e-commerce practice (Includes 18% GST under HSN 330499)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={globalRouting.gstIncludedIndia}
                    onChange={(e) =>
                      setGlobalRouting({
                        ...globalRouting,
                        gstIncludedIndia: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                    International Customs Disclaimer Note
                  </label>
                  <textarea
                    rows={2}
                    value={globalRouting.internationalCustomsNote}
                    onChange={(e) =>
                      setGlobalRouting({
                        ...globalRouting,
                        internationalCustomsNote: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Regional Availability Toggles */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-text-dark">
                Regional Product Availability Rules
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-lilac/30">
                  <div>
                    <span className="text-xs font-bold text-text-dark block">
                      Ayurvedic Nectars & Kumkumadi Formulations
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Allow worldwide export and international shipping
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={globalRouting.ayurvedicExportAllowed}
                    onChange={(e) =>
                      setGlobalRouting({
                        ...globalRouting,
                        ayurvedicExportAllowed: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-lilac/30">
                  <div>
                    <span className="text-xs font-bold text-text-dark block">
                      Haute Botanical Skincare & Cellular Serums
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Global distribution permitted (100% compliant)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Worldwide Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-lilac/30">
                  <div>
                    <span className="text-xs font-bold text-text-dark block">
                      Pediatric Baby Care Line
                    </span>
                    <span className="text-[11px] text-text-muted">
                      Pediatric & ophthalmologist certified worldwide
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Worldwide Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/20 disabled:opacity-60"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save All Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
}
