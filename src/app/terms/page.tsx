import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DynamicPageLayout } from "@/components/layout/DynamicPageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Terms of Service | Duck Cosmetics",
  description: "Terms of Service, Client Agreements, and VIP Pre-Launch Terms for Duck Cosmetics.",
};

export default async function TermsPage() {
  const [page, settings] = await Promise.all([
    dbService.getPageContent("terms"),
    dbService.getSiteSettings(),
  ]);

  return (
    <DynamicPageLayout
      slug="terms"
      title={page?.title || "Terms of Service"}
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      announcementBarText={settings?.announcementBarText || "Free Shipping Over $50 | 100% Cruelty-Free"}
    />
  );
}
