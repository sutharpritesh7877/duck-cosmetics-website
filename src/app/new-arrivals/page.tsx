import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DedicatedCollectionClient } from "@/components/shop/DedicatedCollectionClient";
import { ProductItem } from "@/components/home/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "New Arrivals · The Latest Drop | Duck Cosmetics Haute Atelier",
  description:
    "Discover the latest drop from Duck Cosmetics. Freshly formulated micro-batches, debut botanical elixirs, and limited atelier releases.",
};

export default async function NewArrivalsPage() {
  const [settings, productsRes] = await Promise.all([
    dbService.getSiteSettings(),
    dbService.getProducts({
      sort: "newest",
      limit: 60,
    }),
  ]);

  return (
    <DedicatedCollectionClient
      title="The Latest Drop"
      eyebrow="Fresh Formulations · Atelier Releases"
      description="Freshly formulated micro-batches, debut botanical elixirs, and limited atelier releases. Crafted with rare botanical essences and clinical actives."
      products={productsRes.products as ProductItem[]}
      settings={settings}
      emptyMessage="No new formula drops scheduled today. Please join our VIP waitlist to be alerted first when fresh batches are released."
    />
  );
}
