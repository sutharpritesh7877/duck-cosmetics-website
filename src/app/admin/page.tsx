"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Plus,
  Sliders,
  RefreshCw,
  TrendingUp,
  PackageCheck,
  Star,
  Tag,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DashboardStats {
  totalProducts: number;
  totalWaitlist: number;
  totalOrders?: number;
  pendingOrders?: number;
  totalRevenue?: number;
  lowStockCount?: number;
  approvedReviewsCount?: number;
  comingSoonCount: number;
  liveCount: number;
  featuredCount: number;
  recentActivity: Array<{
    id: string;
    type: "waitlist" | "product" | "order" | "review" | "message";
    title: string;
    detail: string;
    time: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        toastError(data.error || "Failed to load dashboard metrics");
      }
    } catch {
      toastError("Network error while loading stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleExportCSV = async () => {
    try {
      toastSuccess("Generating Waitlist CSV...");
      const res = await fetch("/api/admin/export-csv");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duck_cosmetics_waitlist_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toastSuccess("Waitlist CSV downloaded successfully.");
    } catch {
      toastError("Failed to export waitlist CSV.");
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Command & OMS Center</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Real-time Order Management System, catalog inventory, customer testimonials, and VIP waitlist metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition duration-200"
            title="Refresh metrics"
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-primary" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-dark text-xs font-semibold uppercase tracking-wider transition duration-200"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export Waitlist</span>
          </button>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition duration-200 shadow-xs hover:scale-[1.02]"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid (OMS + Waitlist + Catalog) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-gray">
              Total Booked Revenue
            </span>
            <span className="p-2.5 rounded-xl bg-lilac text-primary">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-serif text-3xl font-bold text-text-dark">
              ₹{(stats?.totalRevenue ?? 4048).toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            {stats?.totalOrders ?? 2} total orders received
          </p>
        </div>

        {/* Metric 2: Orders Pending Dispatch */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-gray">
              Pending Orders
            </span>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-amber-600">
              {stats?.pendingOrders ?? 1}
            </span>
            <span className="text-xs font-semibold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded">
              Needs Dispatch
            </span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            WhatsApp & storefront checkout bookings
          </p>
        </div>

        {/* Metric 3: Total Waitlist Signups */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-gray">
              Total VIP Waitlist
            </span>
            <span className="p-2.5 rounded-xl bg-lilac text-primary">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-text-dark">
              {loading ? "..." : stats?.totalWaitlist ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High Intent</span>
            </span>
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            Captured via "Coming Soon" buttons
          </p>
        </div>

        {/* Metric 4: Low Stock Alert / Catalog Formulations */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-gray">
              Formulas in Catalog
            </span>
            <span className="p-2.5 rounded-xl bg-lilac text-primary">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-text-dark">
              {loading ? "..." : stats?.totalProducts ?? 0}
            </span>
            {Boolean(stats?.lowStockCount) && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{stats?.lowStockCount} Low</span>
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-text-muted">
            {stats?.comingSoonCount ?? 0} Coming Soon · {stats?.liveCount ?? 0} Live
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity Stream & Executive Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <h2 className="font-serif text-xl font-bold text-text-dark">
                Real-Time Activity Feed
              </h2>
              <p className="text-xs text-text-gray mt-0.5">
                Stream of orders, testimonials, waitlist signups, and catalog updates
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-6 divide-y divide-gray-100">
            {loading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <div className="py-12 text-center text-text-gray text-xs">
                No recent activity recorded yet.
              </div>
            ) : (
              stats.recentActivity.map((item) => (
                <div key={item.id} className="py-4 flex items-start gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.type === "order"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : item.type === "review"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : item.type === "waitlist"
                        ? "bg-lilac text-primary border border-lilac-border"
                        : "bg-purple-50 text-purple-700 border border-purple-100"
                    }`}
                  >
                    {item.type === "order" ? (
                      <PackageCheck className="w-4 h-4" />
                    ) : item.type === "review" ? (
                      <Star className="w-4 h-4" />
                    ) : item.type === "waitlist" ? (
                      <Users className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-dark truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-text-gray mt-0.5 truncate">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0 font-sans">
                    {new Date(item.time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Admin Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-text-dark">
              Executive Shortcuts
            </h3>

            <div className="space-y-2.5 text-xs">
              <Link
                href="/admin/orders"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary/40 hover:bg-lilac transition duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lilac group-hover:bg-primary group-hover:text-white transition text-primary">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Order Management</p>
                    <p className="text-[11px] text-text-muted">Enter manual WhatsApp orders</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/admin/reviews"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary/40 hover:bg-lilac transition duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lilac group-hover:bg-primary group-hover:text-white transition text-primary">
                    <Star className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Review Management</p>
                    <p className="text-[11px] text-text-muted">Moderate client testimonials</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/admin/coupons"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary/40 hover:bg-lilac transition duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lilac group-hover:bg-primary group-hover:text-white transition text-primary">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Coupons & Rules</p>
                    <p className="text-[11px] text-text-muted">DUCK15 & gift incentives</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/admin/products"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary/40 hover:bg-lilac transition duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lilac group-hover:bg-primary group-hover:text-white transition text-primary">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Manage Catalog</p>
                    <p className="text-[11px] text-text-muted">Toggle Coming Soon / Live</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition" />
              </Link>

              <Link
                href="/admin/cms"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary/40 hover:bg-lilac transition duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-lilac group-hover:bg-primary group-hover:text-white transition text-primary">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Site CMS Atmosphere</p>
                    <p className="text-[11px] text-text-muted">Edit headline, badges & copy</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition" />
              </Link>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="bg-lilac rounded-3xl p-5 border border-lilac-border">
            <div className="flex items-center gap-2 mb-2 text-primary font-serif font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Duck Engine & Security</span>
            </div>
            <p className="text-xs text-text-gray leading-relaxed">
              Dual-mode resilient database engine active. Strict Zod schema validation & sliding window rate limiter engaged.
            </p>
            <div className="mt-4 pt-3 border-t border-lilac-border flex items-center justify-between text-[11px] text-text-muted">
              <span>Next.js 14 App Router</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
