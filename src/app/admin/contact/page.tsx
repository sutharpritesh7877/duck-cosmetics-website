"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Save,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ContactSettings {
  id?: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email: string;
  address: string;
  bottomText: string;
  updatedAt?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

export default function AdminContactPage() {
  const [settings, setSettings] = useState<ContactSettings>({
    phone1: "+91 79 4001 8899",
    phone2: "+91 98250 12345",
    phone3: "+91 99099 87654",
    email: "concierge@duckcosmetics.com",
    address:
      "Suite 804, The Grand Palais, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054, India",
    bottomText: "Duck Cosmetics — Care for Every Little Moment.",
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"card" | "inbox">("card");

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSettings, resMessages] = await Promise.all([
        fetch("/api/contact-settings"),
        fetch("/api/admin/messages"),
      ]);

      const dataSettings = await resSettings.json();
      const dataMessages = await resMessages.json();

      if (dataSettings.success && dataSettings.contact) {
        setSettings(dataSettings.contact);
      }
      if (dataMessages.success && dataMessages.messages) {
        setMessages(dataMessages.messages);
      }
    } catch {
      toastError("Failed to load contact settings and messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contact-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update contact settings");
      }

      setSettings(data.contact);
      toastSuccess("Ahmedabad Concierge contact card updated successfully!");
    } catch (err: any) {
      toastError(err.message || "Failed to save contact settings.");
    } finally {
      setSaving(false);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Contact & Concierge Center</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Concierge Card & Client Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Manage the Ahmedabad contact card details, 3 direct phone lines, email, address, and review client inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray hover:text-primary text-xs font-semibold uppercase tracking-wider transition"
          >
            <span>View Public /contact</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("card")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
            activeTab === "card"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-text-gray hover:text-text-dark hover:bg-lilac"
          }`}
        >
          Concierge Card Editor
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 ${
            activeTab === "inbox"
              ? "bg-primary text-white shadow-xs"
              : "bg-white text-text-gray hover:text-text-dark hover:bg-lilac"
          }`}
        >
          <span>Client Inquiries Inbox</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "inbox" ? "bg-white text-primary" : "bg-lilac text-primary"
            }`}
          >
            {messages.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Concierge Card Editor */}
      {activeTab === "card" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-text-dark mb-1">
              Contact Card Details
            </h2>
            <p className="text-xs text-text-gray mb-6">
              Updates saved here will instantly alter the dark purple contact card on the `/contact` page.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Phone 1 */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Direct Phone Line 1 (Primary Toll-Free / Office) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone1}
                  onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                  placeholder="+91 79 4001 8899"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Phone 2 */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Direct Phone Line 2 (VIP Concierge) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone2}
                  onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                  placeholder="+91 98250 12345"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Phone 3 */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Direct Phone Line 3 (Press & Wholesale) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.phone3}
                  onChange={(e) => setSettings({ ...settings, phone3: e.target.value })}
                  placeholder="+91 99099 87654"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>Official Concierge Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder="concierge@duckcosmetics.com"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Full Physical Headquarters Address *</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Suite 804, The Grand Palais, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054, India"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white resize-none"
                />
              </div>

              {/* Bottom Serif Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Bottom Brand Serif Quote *</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.bottomText}
                  onChange={(e) => setSettings({ ...settings, bottomText: e.target.value })}
                  placeholder="Duck Cosmetics — Care for Every Little Moment."
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-sm font-serif italic text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-text-muted">
                  {settings.updatedAt ? `Last saved: ${new Date(settings.updatedAt).toLocaleTimeString()}` : "Ready"}
                </span>

                <button
                  type="submit"
                  disabled={saving || loading}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-primary/10 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Contact Card"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview of Dark Purple Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-gray">
                Live Card Preview (Exact Match)
              </span>
              <span className="text-[10px] text-white bg-primary px-2 py-0.5 rounded uppercase">
                #5D3A7A
              </span>
            </div>

            {/* The Dark Purple Card */}
            <div className="rounded-3xl bg-[#5D3A7A] text-white p-7 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="text-[10px] font-sans font-semibold tracking-widest uppercase text-lilac/70 block mb-1">
                  Ahmedabad Concierge
                </span>
                <h3 className="font-serif text-2xl font-normal tracking-tight text-white">
                  Get In Touch
                </h3>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
                {/* Phones */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-lilac" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-lilac/70">Phone Lines</p>
                    <p className="font-medium text-white">{settings.phone1}</p>
                    <p className="font-medium text-white">{settings.phone2}</p>
                    <p className="font-medium text-white">{settings.phone3}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-lilac" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-lilac/70">Direct Email</p>
                    <p className="font-medium text-white">{settings.email}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-lilac" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-lilac/70">Location</p>
                    <p className="font-medium text-white/90 leading-relaxed">{settings.address}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Quote */}
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="font-serif italic text-sm text-lilac/90">
                  &ldquo;{settings.bottomText}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Client Inquiries Inbox */}
      {activeTab === "inbox" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-text-dark">
                Client Contact Messages
              </h2>
              <p className="text-xs text-text-gray mt-0.5">
                Messages received via the `/contact` form with name, email, phone, and inquiry details.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          {/* Messages Table */}
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-lilac/30">
              <MessageSquare className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
              <h3 className="font-serif text-lg font-bold text-text-dark mb-1">
                No inquiries found
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                {searchQuery
                  ? "No messages match your search filter."
                  : "New inquiries submitted on the /contact page will appear here instantly."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-lilac/50 text-[11px] font-semibold text-text-gray uppercase tracking-wider">
                    <th className="py-3 px-4">Client Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Message / Inquiry</th>
                    <th className="py-3 px-4">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-lilac/30 transition">
                      <td className="py-4 px-4 font-semibold text-text-dark">
                        {msg.name}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-primary font-medium">{msg.email}</p>
                        {msg.phone && (
                          <p className="text-text-muted text-[11px]">{msg.phone}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-md">
                        <p className="text-text-dark leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(msg.createdAt).toLocaleDateString()}{" "}
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
