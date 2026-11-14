"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  Sparkles,
  Save,
  RefreshCw,
  Eye,
  Check,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ImageUploadDropzone } from "@/components/admin/ImageUploadDropzone";

interface PromoData {
  id?: string;
  badgeText: string;
  title: string;
  description: string;
  posterImageUrl: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  isActive: boolean;
}

export default function AdminMegaMenuPage() {
  const [promo, setPromo] = useState<PromoData>({
    badgeText: "THE NEW LAUNCH",
    title: "THE VELVET LIP OIL COLLECTION",
    description: "Formulated with French lavender extract & botanical peptides for high-shine, non-sticky luminescence.",
    posterImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    primaryButtonText: "EXPLORE FORMULA",
    primaryButtonLink: "/shop/lips",
    secondaryButtonText: "JOIN VIP WAITLIST",
    secondaryButtonLink: "#waitlist",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchPromo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/mega-menu-promo");
      if (!res.ok) throw new Error("Failed to load promo settings");
      const data = await res.json();
      const promoObj = data?.promo || data;
      if (promoObj && promoObj.title) {
        setPromo(promoObj);
      }
    } catch {
      toastError("Could not load Mega-Menu promo settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/mega-menu-promo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promo),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      toastSuccess("Mega-Menu promo poster published live!");
    } catch {
      toastError("Error saving Mega-Menu promo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Store Navigation CMS</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Mega-Menu Promo Editor
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Customize the editorial right-side showcase poster rendered inside the desktop & mobile &quot;SHOP&quot; Mega-Menu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPromo}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Editor Grid: 7 cols Form, 5 cols Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-serif text-xl font-bold text-text-dark">
                Promo Card Content
              </h2>
              <p className="text-xs text-text-gray mt-0.5">
                All changes reflect immediately in the live preview on the right.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-text-dark cursor-pointer">
                Show Promo
              </label>
              <input
                type="checkbox"
                checked={promo.isActive}
                onChange={(e) => setPromo({ ...promo, isActive: e.target.checked })}
                className="w-4 h-4 text-primary accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Badge Text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Badge Pill Text *
              </label>
              <input
                type="text"
                required
                value={promo.badgeText}
                onChange={(e) => setPromo({ ...promo, badgeText: e.target.value })}
                placeholder="e.g. THE NEW LAUNCH or LIMITED EDITION"
                className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Promo Title (Editorial Serif) *
              </label>
              <input
                type="text"
                required
                value={promo.title}
                onChange={(e) => setPromo({ ...promo, title: e.target.value })}
                placeholder="e.g. THE VELVET LIP OIL COLLECTION"
                className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-sm font-serif font-bold text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Description Copy *
              </label>
              <textarea
                rows={3}
                required
                value={promo.description}
                onChange={(e) => setPromo({ ...promo, description: e.target.value })}
                placeholder="Enter compelling luxury description..."
                className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            {/* Buttons Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Primary Button Text *
                </label>
                <input
                  type="text"
                  required
                  value={promo.primaryButtonText}
                  onChange={(e) => setPromo({ ...promo, primaryButtonText: e.target.value })}
                  placeholder="EXPLORE FORMULA"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Primary Button Link *
                </label>
                <input
                  type="text"
                  required
                  value={promo.primaryButtonLink}
                  onChange={(e) => setPromo({ ...promo, primaryButtonLink: e.target.value })}
                  placeholder="/shop/lips or /products/velvet-lip-oil"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={promo.secondaryButtonText}
                  onChange={(e) => setPromo({ ...promo, secondaryButtonText: e.target.value })}
                  placeholder="JOIN VIP WAITLIST"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={promo.secondaryButtonLink}
                  onChange={(e) => setPromo({ ...promo, secondaryButtonLink: e.target.value })}
                  placeholder="#waitlist (triggers modal) or custom link"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>
            </div>

            {/* Direct Image Upload Dropzone */}
            <div className="pt-2 border-t border-gray-100">
              <ImageUploadDropzone
                value={promo.posterImageUrl}
                onChange={(url) => setPromo({ ...promo, posterImageUrl: url })}
                label="Poster High-Resolution Image (Direct Upload) *"
                description="Upload editorial campaign photo from your computer. Automatically uploaded to storage."
                aspectRatio="portrait"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/admin/categories"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Manage Categories &amp; Tags &rarr;</span>
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Luxury Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-dark">
              <Eye className="w-4 h-4 text-primary" />
              <span>Live Mega-Menu Poster Preview</span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary font-mono px-2 py-0.5 rounded-full font-semibold">
              REAL-TIME SYNC
            </span>
          </div>

          {/* Actual Card replicating frontend MegaMenu design */}
          <div className="bg-lilac/50 p-4 rounded-3xl border border-gray-200 shadow-sm">
            <div className="relative rounded-2xl overflow-hidden min-h-[460px] flex flex-col justify-end p-6 text-white shadow-xl group border border-white/20">
              {/* Background Image */}
              {promo.posterImageUrl ? (
                <Image
                  src={promo.posterImageUrl}
                  alt={promo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                  <span className="text-xs text-white/60">No image uploaded</span>
                </div>
              )}

              {/* Luxury Deep Purple & Vignette Gradient Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(93, 58, 122, 0.95) 0%, rgba(93, 58, 122, 0.5) 50%, rgba(93, 58, 122, 0.15) 100%)",
                }}
              />

              {/* Foreground Content */}
              <div className="relative z-10 space-y-3.5">
                {promo.badgeText && (
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-semibold tracking-widest uppercase text-white border border-white/30">
                    {promo.badgeText}
                  </span>
                )}

                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight text-white drop-shadow-sm">
                  {promo.title}
                </h3>

                <p className="text-xs text-white/90 leading-relaxed font-sans line-clamp-3">
                  {promo.description}
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  {promo.primaryButtonText && (
                    <div className="w-full py-2.5 px-4 bg-white text-primary text-center text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-1.5">
                      <span>{promo.primaryButtonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {promo.secondaryButtonText && (
                    <div className="w-full py-2 text-center text-xs font-medium text-white/90 hover:text-white underline underline-offset-4 tracking-wider uppercase transition">
                      {promo.secondaryButtonText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-text-muted text-center mt-3">
              This card is displayed in the right 4-column section of the desktop &quot;SHOP&quot; Mega-Menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
