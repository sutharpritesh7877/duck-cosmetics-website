import { useState } from "react";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { StoreSettings } from "../../../types";

export function WebsiteContentModule() {
  const currentStaff = authService.getCurrentUser();
  const settings = db.getSettings();

  const [formContent, setFormContent] = useState<Partial<StoreSettings>>({
    heroHeadline: settings.heroHeadline || "Gentle daily care for your whole family.",
    heroSubtitle: settings.heroSubtitle || "Thoughtfully crafted baby care, everyday cosmetics, soothing vapor balms, and herbal ortho oils. Made with plant-rich formulas and verified safety for Indian homes.",
    promoBannerText: settings.promoBannerText || "Buy any cosmetic and unlock a free face wash (₹349 value)",
    logoUrl: settings.logoUrl || "/duck-logo.png",
    autoFreeFaceWashOffer: settings.autoFreeFaceWashOffer ?? true,
  });

  const [tickerItems, setTickerItems] = useState<string[]>(settings.announcementTicker || []);
  const [newTickerText, setNewTickerText] = useState("");
  const [feedback, setFeedback] = useState("");

  const canManage = authService.can("content:manage", currentStaff);

  const handleSaveMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    const current = db.getSettings();
    const updated: StoreSettings = {
      ...current,
      heroHeadline: formContent.heroHeadline,
      heroSubtitle: formContent.heroSubtitle,
      promoBannerText: formContent.promoBannerText,
      logoUrl: formContent.logoUrl,
      autoFreeFaceWashOffer: formContent.autoFreeFaceWashOffer ?? true,
    };

    db.saveSettings(updated, currentStaff.name, currentStaff.role);
    setFeedback("Homepage content, hero headlines, and promotion settings updated successfully.");
  };

  const handleTogglePromo = () => {
    if (!canManage) return;
    const nextVal = !formContent.autoFreeFaceWashOffer;
    setFormContent((prev) => ({ ...prev, autoFreeFaceWashOffer: nextVal }));
    const current = db.getSettings();
    db.saveSettings(
      { ...current, autoFreeFaceWashOffer: nextVal },
      currentStaff.name,
      currentStaff.role
    );
    setFeedback(`Free Face Wash promotion is now ${nextVal ? "ACTIVE" : "INACTIVE"} on storefront.`);
  };

  const handleAddTicker = () => {
    if (!newTickerText.trim() || !canManage) return;
    const updated = [...tickerItems, newTickerText.trim()];
    setTickerItems(updated);
    const current = db.getSettings();
    db.saveSettings({ ...current, announcementTicker: updated }, currentStaff.name, currentStaff.role);
    setNewTickerText("");
    setFeedback("Announcement ticker updated.");
  };

  const handleRemoveTicker = (index: number) => {
    if (!canManage) return;
    const updated = tickerItems.filter((_, idx) => idx !== index);
    setTickerItems(updated);
    const current = db.getSettings();
    db.saveSettings({ ...current, announcementTicker: updated }, currentStaff.name, currentStaff.role);
    setFeedback("Announcement ticker item removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Storefront Marketing & Content CMS</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Website Content & Homepage</h2>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark shadow-sm">
          ✓ {feedback}
        </div>
      )}

      {/* Promotion Logic Control (Audit Item 1: Free Gift Toggle) */}
      <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple/10 pb-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-purple">Promotion Logic & Gift Rules</span>
            <h3 className="font-display text-xl font-bold text-purple-dark">Complimentary Daily Fresh Face Wash Offer</h3>
            <p className="mt-1 text-xs text-ink/50">
              When toggled ON, purchasing any cosmetic product unlocks a complimentary Face Wash ($0.00 / ₹0.00) in the customer cart.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
              formContent.autoFreeFaceWashOffer ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
            }`}>
              {formContent.autoFreeFaceWashOffer ? "● Active & Live" : "○ Inactive"}
            </span>
            {canManage && (
              <button
                type="button"
                onClick={handleTogglePromo}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition ${
                  formContent.autoFreeFaceWashOffer ? "bg-red-600 hover:bg-red-700" : "bg-purple hover:bg-purple-dark"
                }`}
              >
                {formContent.autoFreeFaceWashOffer ? "Toggle OFF Promotion" : "Activate Promotion"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Homepage Hero & Marketing Copy Form */}
      <form onSubmit={handleSaveMarketing} className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-purple/10 pb-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-purple">Everything Is Editable CMS</span>
          <h3 className="font-display text-xl font-bold text-purple-dark">Homepage Hero, Banners & Logo</h3>
          <p className="mt-1 text-xs text-ink/50">
            Changes to headings, subtitles, promotional banner text, and branding reflect instantly on the live website.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs pt-2">
          <label className="sm:col-span-2 block">
            <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Hero Main Heading</span>
            <input
              type="text"
              value={formContent.heroHeadline}
              onChange={(e) => setFormContent({ ...formContent, heroHeadline: e.target.value })}
              required
              className="w-full rounded-xl border border-purple/15 p-2.5 font-display text-base outline-none font-semibold text-purple-dark"
              placeholder="e.g. Gentle daily care for your whole family."
            />
          </label>

          <label className="sm:col-span-2 block">
            <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Hero Subtitle & Brand Story Copy</span>
            <textarea
              rows={3}
              value={formContent.heroSubtitle}
              onChange={(e) => setFormContent({ ...formContent, heroSubtitle: e.target.value })}
              required
              className="w-full rounded-xl border border-purple/15 p-2.5 outline-none leading-relaxed text-ink/80"
              placeholder="Thoughtfully crafted baby care, everyday cosmetics, soothing vapor balms..."
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Free Gift Promo Banner Text</span>
            <input
              type="text"
              value={formContent.promoBannerText}
              onChange={(e) => setFormContent({ ...formContent, promoBannerText: e.target.value })}
              required
              className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              placeholder="Buy any cosmetic and unlock a free face wash (₹349 value)"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Brand Logo URL / Path</span>
            <input
              type="text"
              value={formContent.logoUrl}
              onChange={(e) => setFormContent({ ...formContent, logoUrl: e.target.value })}
              required
              className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px]"
              placeholder="/duck-logo.png or https://cdn.duckcosmetics.in/logo.png"
            />
          </label>
        </div>

        {canManage && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-full bg-purple px-7 py-3 text-xs font-bold text-white uppercase tracking-wider hover:bg-purple-dark transition shadow-md"
            >
              Save Homepage Content
            </button>
          </div>
        )}
      </form>

      {/* Announcement Ticker Editor */}
      <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl font-bold text-purple-dark">Header Announcement Ticker</h3>
        <p className="mt-1 text-xs text-ink/50">
          These animated ticker announcements appear at the very top of the customer storefront across all devices.
        </p>

        <div className="mt-4 space-y-2">
          {tickerItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border border-purple/10 bg-canvas/60 p-3 text-xs">
              <span className="font-medium text-ink/80">{item}</span>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleRemoveTicker(idx)}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {canManage && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g. Diwali festive sale live · Extra 10% off"
              value={newTickerText}
              onChange={(e) => setNewTickerText(e.target.value)}
              className="flex-1 rounded-xl border border-purple/15 bg-white p-2.5 text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddTicker}
              className="rounded-xl bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
            >
              Add Ticker Line
            </button>
          </div>
        )}
      </section>

      {/* Published Policy Content Overview */}
      <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
        <h3 className="font-display text-xl font-bold text-purple-dark">Store Policies & Trust Elements</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          {[
            { title: "Shipping Policy", points: "Free India shipping over ₹999; Flat ₹79 standard rate; 3-5 business days." },
            { title: "Returns Policy", points: "7-day return window for unopened products; damaged item instant replacement." },
            { title: "Privacy Policy", points: "Strict customer data protection; no payment secrets stored locally." },
            { title: "Terms & Conditions", points: "Fair usage, verified MRP pricing inclusive of GST, authentic batch labelling." },
            { title: "FAQ", points: "Frequently asked questions regarding baby care, ortho pain oil, and free face wash." },
          ].map((pol) => (
            <div key={pol.title} className="rounded-2xl border border-purple/10 bg-canvas/40 p-4">
              <strong className="block text-sm font-semibold text-purple-dark">{pol.title}</strong>
              <p className="mt-1.5 text-ink/65 leading-relaxed">{pol.points}</p>
              <span className="mt-3 inline-block rounded bg-mint px-2 py-0.5 text-[8px] font-bold text-purple-dark uppercase">
                Active & Published
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
