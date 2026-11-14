import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { DedicatedCollectionClient } from "@/components/shop/DedicatedCollectionClient";
import { ProductItem } from "@/components/home/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Best Sellers · Our Most Coveted | Duck Cosmetics Haute Atelier",
  description:
    "Explore our most coveted beauty creations. The pinnacle of clinical luxury and Ayurvedic potency, treasured by our connoisseur clientele worldwide.",
};

export default async function BestSellersPage() {
  const [settings, productsRes] = await Promise.all([
    dbService.getSiteSettings(),
    dbService.getProducts({
      bestSellerOnly: true,
      limit: 60,
    }),
  ]);

  return (
    <DedicatedCollectionClient
      title="Our Most Coveted"
      eyebrow="Client Repertoire · Coveted Classics"
      description="The pinnacle of clinical luxury and Ayurvedic potency. Treasured by our connoisseur clientele worldwide."
      products={productsRes.products as ProductItem[]}
      settings={settings}
      emptyMessage="Our artisans are currently formulating the next batch of coveted icons. Please join the waitlist for priority allocation."
    />
  );
}
