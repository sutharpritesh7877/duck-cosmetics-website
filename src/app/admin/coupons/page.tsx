"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Trash2,
  RefreshCw,
  Gift,
  CheckCircle2,
  Percent,
  X,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  freeGift?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountPercent: 15,
    minOrderAmount: 800,
    freeGift: "Complimentary Deluxe Botanical Face Wash (30ml)",
  });

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (data.success && data.coupons) {
        setCoupons(data.coupons);
      } else {
        toastError(data.error || "Failed to load coupons");
      }
    } catch {
      toastError("Network error while loading coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      toastSuccess(`Coupon ${coupon.code} is now ${!coupon.isActive ? "ACTIVE" : "INACTIVE"}`);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: any) {
      toastError(err.message || "Failed to toggle coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion rule?")) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete coupon");
      }

      toastSuccess("Coupon deleted successfully.");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toastError(err.message || "Failed to delete coupon");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create coupon");
      }

      toastSuccess(`Promotion code ${data.coupon.code} activated!`);
      setModalOpen(false);
      setFormData({
        code: "",
        discountPercent: 15,
        minOrderAmount: 800,
        freeGift: "Complimentary Deluxe Botanical Face Wash (30ml)",
      });
      fetchCoupons();
    } catch (err: any) {
      toastError(err.message || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Promotions & Incentive Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Coupons & Automated Rules
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Create discount codes (e.g. DUCK15, VIPGLOW) and set automated rules like free botanical face washes on orders over ₹800.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload coupons"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-lilac/40 text-[11px] font-semibold text-text-gray uppercase tracking-wider">
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-5">Discount %</th>
                <th className="py-3.5 px-5">Min Order (₹)</th>
                <th className="py-3.5 px-5">Automated Gift Rule</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No active promotional codes configured.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-lilac/30 transition">
                    {/* Code */}
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-xs bg-lilac border border-lilac-border text-primary px-2.5 py-1 rounded-md">
                        {coupon.code}
                      </span>
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-5 font-serif font-bold text-sm text-text-dark">
                      {coupon.discountPercent}% OFF
                    </td>

                    {/* Min Order */}
                    <td className="py-4 px-5 font-medium text-text-dark">
                      ₹{coupon.minOrderAmount.toLocaleString("en-IN")}
                    </td>

                    {/* Free Gift */}
                    <td className="py-4 px-5">
                      {coupon.freeGift ? (
                        <div className="flex items-center gap-1.5 text-text-dark">
                          <Gift className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{coupon.freeGift}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted italic">None</span>
                      )}
                    </td>

                    {/* Toggle Active */}
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1.5 rounded-lg text-text-gray hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-text-dark">
                Create Promotional Discount & Gift Rule
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. DUCK15"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    required
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Minimum Order Value (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Automated Gift Rule (Optional)
                </label>
                <input
                  type="text"
                  value={formData.freeGift}
                  onChange={(e) =>
                    setFormData({ ...formData, freeGift: e.target.value })
                  }
                  placeholder="e.g. Free Face Wash on orders over ₹800"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-60"
                >
                  {creating ? "Activating..." : "Activate Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
