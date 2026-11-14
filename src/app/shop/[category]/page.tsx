import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbService } from "@/lib/db";
import { ShopCollectionClient } from "@/components/shop/ShopCollectionClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams?: {
    subcategory?: string;
    sort?: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const categories = await dbService.getCategories();
  const slug = params.category.toLowerCase();
  const cat = categories.find(
    (c) => c.slug.toLowerCase() === slug || c.id.toLowerCase() === slug
  );

  const title = cat ? `${cat.name} Collection` : "Curated Collection";
  return {
    title: `${title} | Duck Cosmetics Haute Atelier`,
    description:
      cat?.description ||
      `Explore exclusive ${title} formulations from Duck Cosmetics. 100% cruelty-free, dermatologically tested, and formulated with rare botanicals.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const slug = params.category.toLowerCase();
  const [categories, settings] = await Promise.all([
    dbService.getCategories(),
    dbService.getSiteSettings(),
  ]);

  const currentCategory =
    categories.find(
      (c) => c.slug.toLowerCase() === slug || c.id.toLowerCase() === slug
    ) || {
      id: slug,
      name: slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      slug: slug,
      description: `Curated ${slug.replace("-", " ")} formulations engineered for radiant, effortless luminescence.`,
    };

  const productsRes = await dbService.getProducts({
    categorySlug: slug,
    subcategorySlug: searchParams?.subcategory,
    sort: searchParams?.sort as any,
    limit: 100,
  });

  return (
    <ShopCollectionClient
      currentCategory={currentCategory}
      allCategories={categories}
      initialProducts={productsRes.products}
      settings={settings}
    />
  );
}