import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DynamicPageLayout } from "@/components/layout/DynamicPageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shipping & Returns Policy | Duck Cosmetics",
  description: "Complimentary Global Shipping and 30-Day Pure Satisfaction Guarantee.",
};

export default async function ShippingPage() {
  const [page, settings] = await Promise.all([
    dbService.getPageContent("shipping"),
    dbService.getSiteSettings(),
  ]);

  return (
    <DynamicPageLayout
      slug="shipping"
      title={page?.title || "Shipping & Returns Policy"}
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      announcementBarText={settings?.announcementBarText || "Free Shipping Over $50 | 100% Cruelty-Free"}
    />
  );
}
