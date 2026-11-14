"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Save,
  RefreshCw,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Shield,
  FileCheck,
  Truck,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface PageData {
  id?: string;
  slug: string;
  title: string;
  content: string;
  updatedAt?: string;
}

const PAGES_CONFIG = [
  { slug: "about", label: "Our Story", icon: BookOpen, desc: "Brand heritage, mission, and Ayurvedic fusion" },
  { slug: "faq", label: "FAQ", icon: HelpCircle, desc: "Accordion questions and answers for pre-launch customers" },
  { slug: "privacy", label: "Privacy Policy", icon: Shield, desc: "Global data protection, GDPR, CCPA, and cookie policies" },
  { slug: "terms", label: "Terms of Service", icon: FileCheck, desc: "Legal governing terms, intellectual property, and orders" },
  { slug: "returns", label: "Refund & Return Policy", icon: FileText, desc: "14-day pure satisfaction returns, hygiene safeguards, and refund turnaround" },
  { slug: "shipping", label: "Shipping Policy", icon: Truck, desc: "Domestic India and express worldwide logistics, carrier SLAs, and tracking" },
];

export default function AdminPagesEditor() {
  const [selectedSlug, setSelectedSlug] = useState<string>("about");
  const [pages, setPages] = useState<Record<string, PageData>>({});
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentContent, setCurrentContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      if (data.success && data.pages) {
        const pageMap: Record<string, PageData> = {};
        data.pages.forEach((p: PageData) => {
          pageMap[p.slug] = p;
        });
        setPages(pageMap);

        const current = pageMap[selectedSlug];
        if (current) {
          setCurrentTitle(current.title);
          setCurrentContent(current.content);
        }
      } else {
        toastError(data.error || "Failed to load informational pages");
      }
    } catch {
      toastError("Network error while loading pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSelectTab = (slug: string) => {
    setSelectedSlug(slug);
    const page = pages[slug];
    if (page) {
      setCurrentTitle(page.title);
      setCurrentContent(page.content);
    } else {
      setCurrentTitle("");
      setCurrentContent("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/pages/${selectedSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentTitle,
          content: currentContent,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save page content");
      }

      setPages((prev) => ({
        ...prev,
        [selectedSlug]: data.page,
      }));

      toastSuccess(`"${currentTitle}" updated and published successfully!`);
    } catch (err: any) {
      toastError(err.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  const activeConfig = PAGES_CONFIG.find((p) => p.slug === selectedSlug) || PAGES_CONFIG[0];

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Content Management System</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Legal & Informational Pages Editor
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Control every paragraph, accordion, and heading on public legal and story pages without code deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${selectedSlug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray hover:text-primary text-xs font-semibold uppercase tracking-wider transition"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <button
            type="button"
            onClick={fetchPages}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload content"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {PAGES_CONFIG.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedSlug === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => handleSelectTab(item.slug)}
              className={`p-4 rounded-2xl border text-left transition duration-200 ${
                isSelected
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/10"
                  : "bg-white text-text-dark border-gray-200 hover:border-lilac-border hover:bg-lilac/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-primary"}`} />
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isSelected ? "bg-white/20 text-white" : "bg-lilac text-primary"
                  }`}
                >
                  /{item.slug}
                </span>
              </div>
              <p className="font-serif font-bold text-sm leading-tight">{item.label}</p>
              <p
                className={`text-[11px] mt-1 line-clamp-1 ${
                  isSelected ? "text-white/80" : "text-text-muted"
                }`}
              >
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Editor Form and Markdown Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-text-dark">
                Editing: {activeConfig.label} Page
              </h2>
              <p className="text-xs text-text-gray mt-0.5">
                URL route: <span className="font-mono text-primary font-semibold">/{selectedSlug}</span>
              </p>
            </div>
            {pages[selectedSlug]?.updatedAt && (
              <span className="text-[11px] text-text-muted">
                Last modified: {new Date(pages[selectedSlug].updatedAt!).toLocaleDateString()}
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                Page Headline / Hero Title *
              </label>
              <input
                type="text"
                required
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="e.g. Our Story, Privacy Policy, Terms of Service"
                className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-sm font-serif font-bold text-text-dark focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark">
                  Editorial Body & Formatting Content *
                </label>
                <span className="text-[11px] text-text-muted">
                  Supports Markdown (`## Heading`, `### Question`, `**bold**`, `- list`)
                </span>
              </div>
              <textarea
                rows={16}
                required
                value={currentContent}
                onChange={(e) => setCurrentContent(e.target.value)}
                placeholder="Write page content here using Markdown formatting..."
                className="w-full font-mono text-xs leading-relaxed px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-text-dark focus:outline-none focus:border-primary focus:bg-white resize-y"
              />
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href={`/${selectedSlug}`}
                target="_blank"
                className="text-xs text-primary font-semibold uppercase tracking-wider hover:underline flex items-center gap-1.5"
              >
                <span>Preview live route</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-primary/10 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Publishing Page..." : "Publish Page Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Help & Markdown formatting tips (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-lilac/70 rounded-3xl p-6 border border-lilac-border">
            <h3 className="font-serif font-bold text-base text-text-dark mb-2">
              Formatting Guidelines
            </h3>
            <p className="text-xs text-text-gray mb-4">
              The public storefront dynamically parses this content to render high-contrast typography, dividers, and accordion panels.
            </p>

            <div className="space-y-3 text-xs font-sans">
              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <p className="font-bold text-text-dark text-[11px] uppercase tracking-wider mb-1">
                  FAQ Accordions
                </p>
                <code className="text-primary text-[11px] block font-mono">
                  ### Are your formulas cruelty-free?
                  <br />
                  Yes, 100% certified cruelty-free.
                </code>
                <p className="text-[10px] text-text-muted mt-1">
                  On the `/faq` page, each `###` heading automatically becomes a clickable accordion toggle!
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <p className="font-bold text-text-dark text-[11px] uppercase tracking-wider mb-1">
                  Section Headings
                </p>
                <code className="text-primary text-[11px] block font-mono">
                  ## 1. Information We Collect
                </code>
                <p className="text-[10px] text-text-muted mt-1">
                  Renders as elegant Playfair Display serif subtitles.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <p className="font-bold text-text-dark text-[11px] uppercase tracking-wider mb-1">
                  Bullet Points
                </p>
                <code className="text-primary text-[11px] block font-mono">
                  - Dermatologically tested
                  <br />- 0% Parabens & Sulfates
                </code>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200">
            <h4 className="font-serif font-bold text-sm text-text-dark mb-1">
              Zero Hardcoded Content
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Every change you save here is permanently committed to your PostgreSQL database and will instantly reflect on Duck Cosmetics worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
