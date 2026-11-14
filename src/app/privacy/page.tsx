import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DynamicPageLayout } from "@/components/layout/DynamicPageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Privacy Policy | Duck Cosmetics",
  description: "Duck Cosmetics Client Privacy, 256-bit SSL Security, and Data Protection Pledge.",
};

export default async function PrivacyPage() {
  const [page, settings] = await Promise.all([
    dbService.getPageContent("privacy"),
    dbService.getSiteSettings(),
  ]);

  return (
    <DynamicPageLayout
      slug="privacy"
      title={page?.title || "Privacy Policy"}
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      announcementBarText={settings?.announcementBarText || "Free Shipping Over $50 | 100% Cruelty-Free"}
    />
  );
}
