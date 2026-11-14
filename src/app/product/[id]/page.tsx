import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbService } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductPageProps {
  params: { id: string };
}

/**
 * Dynamic Open Graph (OG) & Social Sharing Metadata
 * When shared on WhatsApp, iMessage, Twitter, etc., the preview shows the exact product image & name!
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await dbService.getProductById(params.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!product) {
    return {
      title: "Product Not Found | Duck Cosmetics",
      description: "The requested haute beauty formulation was not found in our catalog.",
    };
  }

  const cleanDescription = product.description.slice(0, 160);
  const imageUrl = product.imageUrl.startsWith("http")
    ? product.imageUrl
    : `${appUrl}${product.imageUrl}`;

  return {
    title: `${product.title} | Duck Cosmetics Haute Beauty`,
    description: cleanDescription,
    alternates: {
      canonical: `${appUrl}/product/${product.id}`,
    },
    openGraph: {
      title: `${product.title} — Duck Cosmetics Atelier`,
      description: cleanDescription,
      url: `${appUrl}/product/${product.id}`,
      siteName: "Duck Cosmetics",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | Duck Cosmetics`,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await dbService.getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Fetch related complementary formulations
  const relatedRes = await dbService.getProducts({
    categoryId: product.categoryId,
    limit: 6,
  });

  const relatedProducts = relatedRes.products.filter((p) => p.id !== product.id);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-primary selection:text-white">
      <Header />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
      <Footer />
    </div>
  );
}
