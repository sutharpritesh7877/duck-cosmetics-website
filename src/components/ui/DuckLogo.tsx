"use client";

import React from "react";
import Image from "next/image";

interface DuckLogoProps {
  /**
   * Note: Per strict brand guidelines, the logo is ALWAYS the original
   * Deep Purple (#5D3A7A) asset and never altered to white or black.
   */
  variant?: "purple" | "white";
  className?: string;
  priority?: boolean;
}

export function DuckLogo({
  variant = "purple",
  className = "h-10 w-auto max-w-[160px]",
  priority = false,
}: DuckLogoProps) {
  // Always use the original Deep Purple (#5D3A7A) high-resolution 2x WebP asset
  // White variant fallback provided only for strict dark surfaces
  const logoSrc = variant === "white" ? "/duck-logo-white.webp" : "/duck-logo.webp";

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <Image
        src={logoSrc}
        alt="dUCK COSMETICS"
        width={559}
        height={276}
        priority={priority}
        unoptimized
        className="w-full h-full object-contain object-left"
      />
    </div>
  );
}