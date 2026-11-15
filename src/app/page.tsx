import React from "react";
import { dbService } from "@/lib/db";
import { DuckStoreClient } from "@/components/home/DuckStoreClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [settings, productsResult, contact] = await Promise.all([
    dbService.getSiteSettings(),
    dbService.getProducts({ limit: 40 }),
    dbService.getContactSettings(),
  ]);

  return (
    <DuckStoreClient
      initialSettings={settings}
      initialProducts={productsResult.products}
      initialContact={contact}
    />
  );
}
