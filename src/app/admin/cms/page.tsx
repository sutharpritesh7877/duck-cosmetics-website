"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sliders, Sparkles, Save, Eye, RefreshCw, HeartHandshake, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ImageUploadDropzone } from "@/components/admin/ImageUploadDropzone";

interface SiteSettings {
  id: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  announcementBarText: string;
  footerTagline?: string;
  trustBadge1?: string;
  trustBadge2?: string;
  maisonHeadline?: string;
  maisonSubheadline?: string;
  updatedAt?: string;
}

export default function AdminCmsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: "default",
    heroHeadline: "REDEFINE YOUR GLOW",
    heroSubheadline:
      "Unveiling premium, playful & sophisticated beauty. Consciously formulated botanicals engineered for radiant, effortless luminescence.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
    announcementBarText: "Free Shipping Over $50 | 100% Cruelty-Free",
    footerTagline: "Duck Cosmetics — Redefining high-fashion beauty with conscious botanicals.",
    trustBadge1: "100% CRUELTY-FREE",
    trustBadge2: "DERMATOLOGICALLY TESTED",
    maisonHeadline: "SOPHISTICATED SCIENCE, PLAYFUL RADIANCE",
    maisonSubheadline:
      "Formulated in boutique laboratories with clean active botanicals. 0% Parabens, 100% Vegan Radiance.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          ...data.settings,
          footerTagline: data.settings.footerTagline || "Duck Cosmetics — Redefining high-fashion beauty with conscious botanicals.",
          trustBadge1: data.settings.trustBadge1 || "100% CRUELTY-FREE",
          trustBadge2: data.settings.trustBadge2 || "DERMATOLOGICALLY TESTED",
          maisonHeadline: data.settings.maisonHeadline || "SOPHISTICATED SCIENCE, PLAYFUL RADIANCE",
          maisonSubheadline: data.settings.maisonSubheadline || "Formulated in boutique laboratories with clean active botanicals. 0% Parabens, 100% Vegan Radiance.",
        });
      } else {
        toastError(data.error || "Failed to load site CMS settings");
      }
    } catch {
      toastError("Network error while loading CMS settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroHeadline: settings.heroHeadline,
          heroSubheadline: settings.heroSubheadline,
          heroImageUrl: settings.heroImageUrl,
          announcementBarText: settings.announcementBarText,
          footerTagline: settings.footerTagline,
          trustBadge1: settings.trustBadge1,
          trustBadge2: settings.trustBadge2,
          maisonHeadline: settings.maisonHeadline,
          maisonSubheadline: settings.maisonSubheadline,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      toastSuccess("Site CMS settings published successfully! Storefront updated.");
    } catch (err: any) {
      toastError(err.message || "Failed to update CMS settings.");
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
            <Sliders className="w-3.5 h-3.5" />
            <span>Content Management System</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Site Editor & Atmosphere
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Zero hardcoded copy: Edit the Hero Headline, Model Image, Badges, Brand Philosophy, and Footer Tagline without touching code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <h2 className="font-serif text-xl font-bold text-text-dark mb-1">
            Global Content Fields
          </h2>
          <p className="text-xs text-text-gray mb-6">
            Changes are saved directly to the database and reflect live across desktop and mobile.
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Field 1: Announcement Bar Text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Top Announcement Bar Text *
              </label>
              <input
                type="text"
                required
                value={settings.announcementBarText}
                onChange={(e) =>
                  setSettings({ ...settings, announcementBarText: e.target.value })
                }
                placeholder="e.g. Free Shipping Over $50 | 100% Cruelty-Free"
                className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Renders at the very top of every page in deep purple `#5D3A7A`.
              </p>
            </div>

            {/* Field 2: Hero Headline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Hero Headline (Editorial Serif) *
              </label>
              <input
                type="text"
                required
                value={settings.heroHeadline}
                onChange={(e) =>
                  setSettings({ ...settings, heroHeadline: e.target.value })
                }
                placeholder="REDEFINE YOUR GLOW"
                className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-sm font-serif font-bold text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
              <p className="text-[11px] text-text-muted mt-1">
                The primary high-impact headline displayed on the split 50/50 hero.
              </p>
            </div>

            {/* Field 3: Hero Subheadline */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Hero Subheadline & Formulation Ethos *
              </label>
              <textarea
                rows={3}
                required
                value={settings.heroSubheadline}
                onChange={(e) =>
                  setSettings({ ...settings, heroSubheadline: e.target.value })
                }
                placeholder="Unveiling premium, playful & sophisticated beauty..."
                className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
              <p className="text-[11px] text-text-muted mt-1">
                High-fashion narrative under the main headline.
              </p>
            </div>

            {/* Field 4: Hero Editorial Model Image (Direct Upload + Dropzone) */}
            <div>
              <ImageUploadDropzone
                value={settings.heroImageUrl}
                onChange={(url) => setSettings({ ...settings, heroImageUrl: url })}
                label="Hero Editorial Model Image *"
                description="Drag & drop a high-res editorial portrait (JPG, PNG, WebP) or click to browse. Automatically uploads to server."
                aspectRatio="portrait"
              />
              <p className="text-[11px] text-text-muted mt-1.5">
                Editorial portrait of glowing model displayed prominently on the hero split-screen.
              </p>
            </div>

            {/* Preset High-Fashion Image Options */}
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2">
                Quick Preset High-Fashion Editorial Portraits:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    name: "Dewy Glow",
                    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
                  },
                  {
                    name: "Editorial Silk",
                    url: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop",
                  },
                  {
                    name: "Golden Radiance",
                    url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop",
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSettings({ ...settings, heroImageUrl: preset.url })}
                    className={`p-2 rounded-xl text-left border text-[11px] font-medium transition ${
                      settings.heroImageUrl === preset.url
                        ? "border-primary bg-lilac text-primary"
                        : "border-gray-200 hover:bg-lilac/50 text-text-gray"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-serif font-bold text-sm text-text-dark mb-3">
                Trust Badges (Hero Section)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Trust Badge 1
                  </label>
                  <input
                    type="text"
                    value={settings.trustBadge1 || ""}
                    onChange={(e) => setSettings({ ...settings, trustBadge1: e.target.value })}
                    placeholder="100% CRUELTY-FREE"
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Trust Badge 2
                  </label>
                  <input
                    type="text"
                    value={settings.trustBadge2 || ""}
                    onChange={(e) => setSettings({ ...settings, trustBadge2: e.target.value })}
                    placeholder="DERMATOLOGICALLY TESTED"
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Maison Section Copy */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-serif font-bold text-sm text-text-dark mb-3">
                Maison Brand Philosophy Section
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Maison Headline (Editorial Serif)
                  </label>
                  <input
                    type="text"
                    value={settings.maisonHeadline || ""}
                    onChange={(e) => setSettings({ ...settings, maisonHeadline: e.target.value })}
                    placeholder="SOPHISTICATED SCIENCE, PLAYFUL RADIANCE"
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Maison Subtext & Philosophy Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={settings.maisonSubheadline || ""}
                    onChange={(e) => setSettings({ ...settings, maisonSubheadline: e.target.value })}
                    placeholder="Formulated in boutique laboratories with clean active botanicals..."
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Footer Brand Tagline */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="font-serif font-bold text-sm text-text-dark mb-3">
                Global Footer Tagline
              </h3>
              <div>
                <input
                  type="text"
                  value={settings.footerTagline || ""}
                  onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                  placeholder="Duck Cosmetics — Redefining high-fashion beauty with conscious botanicals."
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Displayed at the bottom of the deep purple footer across all pages.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                {settings.updatedAt ? `Last saved: ${new Date(settings.updatedAt).toLocaleTimeString()}` : "Ready to publish"}
              </span>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-primary/10 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Publishing Changes..." : "Publish Site Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Visual Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-gray flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" />
              <span>Live Storefront Preview</span>
            </span>
            <span className="text-[10px] text-text-muted bg-lilac px-2 py-0.5 rounded uppercase">
              Real-time Reactive
            </span>
          </div>

          {/* Mini Mockup Container */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
            {/* Top Bar Preview */}
            <div className="bg-primary text-white text-[9px] py-1.5 px-3 text-center uppercase tracking-widest font-sans font-medium truncate">
              {settings.announcementBarText || "Free Shipping Over $50 | 100% Cruelty-Free"}
            </div>

            {/* Header Preview */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
              <span className="font-serif font-bold text-xs tracking-widest">
                DUCK COSMETICS
              </span>
              <span className="text-[9px] font-sans text-primary font-semibold uppercase">
                PRE-LAUNCH
              </span>
            </div>

            {/* Hero Split Preview */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-white to-lilac/30">
              <div className="space-y-2.5">
                <span className="inline-block text-[9px] font-semibold uppercase tracking-widest text-primary bg-lilac px-2 py-0.5 rounded">
                  Pre-Launch Exclusive
                </span>

                <h3 className="font-serif text-lg sm:text-xl font-normal text-text-dark leading-tight line-clamp-2">
                  {settings.heroHeadline || "REDEFINE YOUR GLOW"}
                </h3>

                <p className="font-sans text-[11px] text-text-gray leading-snug line-clamp-3">
                  {settings.heroSubheadline}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-primary text-white text-[9px] font-bold uppercase tracking-wider">
                    Join Waitlist
                  </span>
                  <span className="text-[9px] text-text-muted uppercase tracking-wider">
                    {settings.trustBadge1 || "100% CRUELTY-FREE"}
                  </span>
                </div>
              </div>

              {/* Editorial Image Preview */}
              <div className="mt-4 relative aspect-[4/3] rounded-xl overflow-hidden bg-lilac border border-lilac-border">
                {settings.heroImageUrl ? (
                  <Image
                    src={settings.heroImageUrl}
                    alt="Preview model"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-text-muted">
                    No image URL provided
                  </div>
                )}
              </div>
            </div>

            {/* Maison Philosophy Preview */}
            <div className="p-4 bg-lilac/50 border-t border-gray-100 text-xs">
              <p className="font-serif font-bold text-text-dark text-xs mb-1">
                {settings.maisonHeadline || "SOPHISTICATED SCIENCE, PLAYFUL RADIANCE"}
              </p>
              <p className="text-[10px] text-text-muted line-clamp-2">
                {settings.maisonSubheadline}
              </p>
            </div>

            {/* Footer Tagline Preview */}
            <div className="p-3 bg-[#5D3A7A] text-white text-[9px] text-center font-sans">
              <p className="text-lilac/80 truncate">
                {settings.footerTagline || "Duck Cosmetics — Redefining high-fashion beauty with conscious botanicals."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
