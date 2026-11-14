import React from "react";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 space-y-8">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-72 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
