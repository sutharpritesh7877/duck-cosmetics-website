import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DynamicPageLayout } from "@/components/layout/DynamicPageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Our Story — Haute Skincare & Ayurvedic Purity | Duck Cosmetics",
  description:
    "Explore the Duck Cosmetics Maison philosophy, bridging Ayurvedic botanical purity with advanced dermatological Swiss bio-fermentation.",
};

export default async function AboutPage() {
  const [page, settings] = await Promise.all([
    dbService.getPageContent("about"),
    dbService.getSiteSettings(),
  ]);

  return (
    <DynamicPageLayout
      slug="about"
      title={page?.title || "Our Story — Sophisticated Science & Ayurvedic Purity"}
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      announcementBarText={settings?.announcementBarText || "Free Shipping Over $50 | 100% Cruelty-Free"}
    />
  );
}
