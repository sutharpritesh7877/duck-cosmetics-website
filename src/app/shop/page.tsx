import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { ShopCollectionClient } from "@/components/shop/ShopCollectionClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Formulations | Duck Cosmetics Haute Atelier",
  description:
    "Explore the complete Duck Cosmetics catalog. Clinical active skincare, classical Kashmiri saffron Ayurvedic nectars, and pediatric-tested Baby Care.",
};

interface ShopPageProps {
  searchParams?: {
    search?: string;
    sort?: string;
    filter?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [categories, settings, productsRes] = await Promise.all([
    dbService.getCategories(),
    dbService.getSiteSettings(),
    dbService.getProducts({
      limit: 100,
      search: searchParams?.search,
      sort: (searchParams?.sort as any) || (searchParams?.filter === "best" ? "featured" : undefined),
    }),
  ]);

  return (
    <ShopCollectionClient
      currentCategory={null}
      allCategories={categories}
      initialProducts={productsRes.products}
      settings={settings}
    />
  );
}