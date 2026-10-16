import { useState } from "react";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function WebsiteContentModule() {
  const currentStaff = authService.getCurrentUser();
  const settings = db.getSettings();

  const [tickerItems, setTickerItems] = useState<string[]>(settings.announcementTicker);
  const [newTickerText, setNewTickerText] = useState("");
  const [feedback, setFeedback] = useState("");

  const canManage = authService.can("content:manage", currentStaff);

  const handleAddTicker = () => {
    if (!newTickerText.trim()) return;
    const updated = [...tickerItems, newTickerText.trim()];
    setTickerItems(updated);
    db.saveSettings({ ...settings, announcementTicker: updated }, currentStaff.name, currentStaff.role);
    setNewTickerText("");
    setFeedback("Announcement ticker updated.");
  };

  const handleRemoveTicker = (index: number) => {
    const updated = tickerItems.filter((_, idx) => idx !== index);
    setTickerItems(updated);
    db.saveSettings({ ...settings, announcementTicker: updated }, currentStaff.name, currentStaff.role);
    setFeedback("Announcement ticker item removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Storefront Marketing</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Website Content & Homepage</h2>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

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
