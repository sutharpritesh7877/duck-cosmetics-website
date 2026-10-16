import { useState } from "react";
import { Coupon } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function CouponsModule() {
  const currentStaff = authService.getCurrentUser();
  const coupons = db.getCoupons();
  const settings = db.getSettings();

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [promoOfferEnabled, setPromoOfferEnabled] = useState(settings.autoFreeFaceWashOffer);
  const [feedback, setFeedback] = useState("");

  const canManage = authService.can("coupons:manage", currentStaff);

  const handleTogglePromo = () => {
    const nextVal = !promoOfferEnabled;
    setPromoOfferEnabled(nextVal);
    db.saveSettings({ ...settings, autoFreeFaceWashOffer: nextVal }, currentStaff.name, currentStaff.role);
    setFeedback(`Automatic free Face Wash offer is now ${nextVal ? "Active" : "Paused"}.`);
  };

  const handleSaveCoupon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const couponData: Coupon = {
      id: editingCoupon?.id || `cpn-${Date.now()}`,
      code: (form.get("code") as string).trim().toUpperCase(),
      description: form.get("description") as string,
      discountType: form.get("discountType") as any,
      discountValue: Number(form.get("discountValue")),
      minOrderValue: Number(form.get("minOrderValue") || 0),
      maxDiscount: Number(form.get("maxDiscount") || 0) || undefined,
      validFrom: (form.get("validFrom") as string) || new Date().toISOString(),
      validUntil: (form.get("validUntil") as string) || "2026-12-31T23:59:59Z",
      usageLimit: Number(form.get("usageLimit") || 500),
      usageCount: editingCoupon?.usageCount || 0,
      isActive: form.get("isActive") === "true",
    };

    db.saveCoupon(couponData, currentStaff.name, currentStaff.role);
    setFeedback(`Coupon code ${couponData.code} saved.`);
    setEditingCoupon(null);
    setIsNewModalOpen(false);
  };

  const handleToggleCouponActive = (c: Coupon) => {
    const updated: Coupon = { ...c, isActive: !c.isActive };
    db.saveCoupon(updated, currentStaff.name, currentStaff.role);
    setFeedback(`Coupon ${c.code} is now ${updated.isActive ? "Active" : "Disabled"}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Discounts & Campaigns</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Coupons & Promotions</h2>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingCoupon(null);
              setIsNewModalOpen(true);
            }}
            className="rounded-full bg-purple px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-purple-dark shadow-sm"
          >
            + Create Coupon Code
          </button>
        )}
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      {/* Special Promotional Rule Banner */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-purple p-6 text-white shadow-md sm:flex-row sm:items-center">
        <div>
          <span className="text-[9px] font-bold tracking-wider text-lilac uppercase">Core Promotional Rule</span>
          <h3 className="mt-1 font-display text-2xl font-semibold">Free Face Wash with any Cosmetic</h3>
          <p className="mt-1 text-xs text-white/70 max-w-xl">
            Automatically unlocks a complimentary Daily Fresh Face Wash (₹349 value) whenever a customer adds any Cosmetic item to their bag.
          </p>
        </div>
        <button
          onClick={handleTogglePromo}
          disabled={!canManage}
          className={`relative h-10 w-18 shrink-0 rounded-full transition ${promoOfferEnabled ? "bg-coral" : "bg-white/20"}`}
        >
          <span className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition ${promoOfferEnabled ? "left-9" : "left-1"}`} />
        </button>
      </section>

      {/* Coupons Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Promo Code</th>
                <th className="px-4 py-3.5">Discount Offer</th>
                <th className="px-4 py-3.5">Min Order</th>
                <th className="px-4 py-3.5">Usage / Limit</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {coupons.map((c) => (
                <tr key={c.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5">
                    <span className="rounded-lg bg-lilac/70 px-2.5 py-1 font-mono font-bold text-purple text-sm">
                      {c.code}
                    </span>
                    <small className="block mt-1 text-ink/50">{c.description}</small>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-purple-dark text-sm">
                    {c.discountType === "percentage" ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat Off`}
                    {c.maxDiscount ? <span className="block text-[10px] text-ink/40 font-normal">Max ₹{c.maxDiscount}</span> : null}
                  </td>
                  <td className="px-4 py-3.5 text-ink/65 font-medium">₹{c.minOrderValue}</td>
                  <td className="px-4 py-3.5 text-ink/70">
                    <strong>{c.usageCount}</strong> / {c.usageLimit} uses
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        c.isActive ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleToggleCouponActive(c)}
                          className="rounded-full bg-canvas px-3 py-1 text-[10px] font-bold uppercase text-ink/60 hover:bg-lilac hover:text-purple"
                        >
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => setEditingCoupon(c)}
                          className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold uppercase text-purple hover:bg-purple hover:text-white"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal */}
      {(isNewModalOpen || editingCoupon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => { setIsNewModalOpen(false); setEditingCoupon(null); }}>
          <form
            onSubmit={handleSaveCoupon}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display text-xl font-bold text-purple-dark">
              {editingCoupon ? `Edit: ${editingCoupon.code}` : "Create New Coupon"}
            </h3>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Coupon Code</span>
              <input
                name="code"
                defaultValue={editingCoupon?.code || ""}
                required
                placeholder="e.g. DUCK20"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono uppercase"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Description / Customer Banner</span>
              <input
                name="description"
                defaultValue={editingCoupon?.description || ""}
                required
                placeholder="e.g. 20% off on all cosmetics above ₹999"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Discount Type</span>
                <select
                  name="discountType"
                  defaultValue={editingCoupon?.discountType || "percentage"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat (₹)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Discount Value</span>
                <input
                  type="number"
                  name="discountValue"
                  defaultValue={editingCoupon?.discountValue || 15}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Min Order Value (₹)</span>
                <input
                  type="number"
                  name="minOrderValue"
                  defaultValue={editingCoupon?.minOrderValue || 0}
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Max Discount Cap (₹)</span>
                <input
                  type="number"
                  name="maxDiscount"
                  defaultValue={editingCoupon?.maxDiscount || ""}
                  placeholder="Optional cap"
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Max Usage Limit</span>
                <input
                  type="number"
                  name="usageLimit"
                  defaultValue={editingCoupon?.usageLimit || 500}
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Active Status</span>
                <select
                  name="isActive"
                  defaultValue={editingCoupon?.isActive !== false ? "true" : "false"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => { setIsNewModalOpen(false); setEditingCoupon(null); }}
                className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
              >
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
