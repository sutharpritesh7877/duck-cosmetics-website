import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DynamicPageLayout } from "@/components/layout/DynamicPageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Duck Cosmetics Client Concierge",
  description:
    "Find answers about Duck Cosmetics pre-launch VIP allocations, ingredients, Baby Care formulations, and worldwide shipping.",
};

export default async function FaqPage() {
  const [page, settings] = await Promise.all([
    dbService.getPageContent("faq"),
    dbService.getSiteSettings(),
  ]);

  return (
    <DynamicPageLayout
      slug="faq"
      title={page?.title || "Frequently Asked Questions"}
      content={page?.content || ""}
      updatedAt={page?.updatedAt}
      announcementBarText={settings?.announcementBarText || "Free Shipping Over $50 | 100% Cruelty-Free"}
    />
  );
}
