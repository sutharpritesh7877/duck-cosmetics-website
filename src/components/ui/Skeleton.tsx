"use client";

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Product Card Skeleton matching exact dimensions of storefront product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-3xl p-4 sm:p-5 border border-lilac-border shadow-xs space-y-4">
      {/* 1:1 Aspect Ratio Image Placeholder */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-lilac/60">
        <Skeleton className="w-full h-full rounded-2xl" />
        {/* Badge placeholder */}
        <div className="absolute top-3 left-3 w-20 h-5">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
      </div>

      {/* Meta lines */}
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
      </div>

      {/* Action Button Placeholder */}
      <div className="pt-2">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid of Product Card Skeletons
 */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-card-${i}`} />
      ))}
    </div>
  );
}

/**
 * Split-screen Product Detail Page (PDP) Skeleton
 */
export function PdpSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-3 w-16 rounded-full" />
        <span className="text-gray-300">/</span>
        <Skeleton className="h-3 w-24 rounded-full" />
        <span className="text-gray-300">/</span>
        <Skeleton className="h-3 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Image Gallery Skeleton (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-lilac/40">
            <Skeleton className="w-full h-full rounded-3xl" />
          </div>
          {/* Thumbnail row */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          </div>
        </div>

        {/* Right Column: Formulation Details Skeleton (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-8 w-4/5 rounded-xl" />
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>

          <div className="flex items-baseline gap-3 pt-2">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-11/12 rounded-full" />
            <Skeleton className="h-3.5 w-4/5 rounded-full" />
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>

          {/* Accordion Skeletons */}
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
