import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DynamicPageLayout } from "@/components/layout/DynamicPageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Refund & Return Policy | Duck Cosmetics",
  description: "Pure Satisfaction Guarantee · 14-Day Return Policy on unopened cosmetic formulations.",
};

export default async function ReturnsPage() {
  const [page, settings] = await Promise.all([
    dbService.getPageContent("returns"),
    dbService.getSiteSettings(),
  ]);

  return (
    <DynamicPageLayout
      slug="returns"
      title={page?.title || "Refund & Return Policy"}
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      announcementBarText={settings?.announcementBarText || "Free Shipping Over ₹800 | 100% Cruelty-Free"}
    />
  );
}
