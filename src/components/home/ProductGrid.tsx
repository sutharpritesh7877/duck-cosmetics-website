"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShoppingBag, Eye, Heart, Star, Check } from "lucide-react";
import { useToast } from "../ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";

export interface ProductItem {
  id: string;
  title: string;
  description?: string;
  price?: number;
  mrp?: number;
  sellingPrice?: number;
  costPrice?: number;
  stock?: number;
  imageUrl: string;
  backImageUrl?: string;
  textureImageUrl?: string;
  lifestyleImageUrl?: string;
  galleryImages?: string[];
  categoryId: string;
  status: "DRAFT" | "COMING_SOON" | "LIVE";
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductGridProps {
  products: ProductItem[];
  isLoading?: boolean;
  onSelectProductForWaitlist: (productTitle: string) => void;
  onSelectProductForDetails?: (product: ProductItem) => void;
  onAddToCart?: (product: ProductItem) => void;
  selectedCategorySlug?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  onSelectProductForWaitlist,
  onSelectProductForDetails,
  onAddToCart,
  selectedCategorySlug,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  const { info: toastInfo, success: toastSuccess } = useToast();
  const { formatPrice } = useCurrency();

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const nextState = !prev[productId];
      if (nextState) {
        toastInfo("Added formula to your private wishlist.");
      }
      return { ...prev, [productId]: nextState };
    });
  };

  // Rule: DRAFT products are hidden from the website entirely
  const visibleProducts = products.filter((p) => p.status !== "DRAFT");

  // Derive unique categories from visible products
  const categoryMap = new Map<string, { id: string; name: string; slug: string }>();
  visibleProducts.forEach((p) => {
    if (p.category?.name) {
      categoryMap.set(p.categoryId, {
        id: p.categoryId,
        name: p.category.name,
        slug: p.category.slug || p.categoryId,
      });
    }
  });

  const categories = [
    { id: "ALL", name: "All Creations", slug: "all" },
    ...Array.from(categoryMap.values()),
  ];

  const activeCategoryId = selectedCategorySlug
    ? categories.find((c) => c.slug === selectedCategorySlug)?.id || selectedCategory
    : selectedCategory;

  const filteredProducts =
    activeCategoryId === "ALL"
      ? visibleProducts
      : visibleProducts.filter((p) => p.categoryId === activeCategoryId);

  return (
    <section id="products" className="py-24 bg-white border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div id="best-sellers" className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-lilac border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>The Debut Collection</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-dark tracking-tight">
            OUR BEST SELLERS
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-base text-text-gray leading-relaxed">
            Crafted with rare botanical essences and clinically proven skin-renewing active compounds. Currently in exclusive pre-release.
          </p>

          {/* Filter Pills */}
          {categories.length > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                    activeCategoryId === cat.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-lilac text-text-gray hover:text-text-dark hover:bg-lilac-subtle"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State: Skeleton Loaders */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="flex flex-col rounded-3xl bg-lilac p-4 border border-lilac-border animate-pulse"
              >
                <div className="aspect-square w-full rounded-2xl bg-gray-200/70 mb-4" />
                <div className="h-3 w-1/3 bg-gray-200/80 rounded mb-2" />
                <div className="h-5 w-3/4 bg-gray-200/80 rounded mb-4" />
                <div className="h-11 w-full bg-gray-200/80 rounded-xl mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-lilac border border-lilac-border">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="font-serif text-xl text-text-dark">No products found</p>
            <p className="font-sans text-xs text-text-gray mt-1">
              Select another category or check back soon for upcoming formula reveals.
            </p>
          </div>
        ) : (
          /* 4-column (desktop), 2-column (tablet), 1-column (mobile) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product, index) => {
              const isLive = product.status === "LIVE";
              const isLiked = likedProducts[product.id];
              const categoryName = product.category?.name || "Pre-Launch Exclusive";
              const sellingPrice = product.sellingPrice ?? product.price ?? 0;
              const mrp = product.mrp ?? 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
                  className="group flex flex-col justify-between rounded-3xl bg-[#F8F6FA] p-4 sm:p-5 border border-lilac-border transition-all duration-400 hover:shadow-[0_20px_45px_rgba(93,58,122,0.16)] hover:border-primary/50"
                >
                  {/* Top: 1:1 Aspect Ratio Image Container */}
                  <div
                    onClick={() => onSelectProductForDetails?.(product)}
                    className="relative aspect-square w-full rounded-2xl overflow-hidden bg-lilac-subtle flex items-center justify-center cursor-pointer group/img"
                  >
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover/img:scale-108 transition-transform duration-700 ease-out"
                    />

                    {/* Quick View Hover Pill */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-primary text-[11px] font-sans font-semibold tracking-wider uppercase shadow-md">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Formula</span>
                      </span>
                    </div>

                    {/* Pre-launch / Live Tag Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {isLive ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm">
                          Available Now
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-primary text-[10px] font-sans font-bold uppercase tracking-wider border border-lilac-border shadow-xs">
                          Pre-Launch
                        </span>
                      )}
                    </div>

                    {/* Wishlist Like Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(product.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-text-dark hover:text-rose-600 transition shadow-xs z-10 pointer-events-auto"
                      aria-label={
                        isLiked
                          ? `Remove ${product.title} from wishlist`
                          : `Add ${product.title} to wishlist`
                      }
                    >
                      <Heart
                        className={`w-4 h-4 transition ${
                          isLiked ? "fill-rose-500 text-rose-500" : "text-text-dark"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Middle Content: Category, Rating & Title */}
                  <div
                    onClick={() => onSelectProductForDetails?.(product)}
                    className="mt-4 flex flex-col flex-grow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      {/* Category */}
                      <span className="font-sans text-[11px] font-semibold tracking-widest text-text-gray uppercase truncate max-w-[170px]">
                        {categoryName}
                      </span>
                      {/* Rating pill */}
                      <div className="flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{product.rating ?? 4.9}</span>
                      </div>
                    </div>

                    {/* Product Title linking directly to PDP */}
                    <Link
                      href={`/product/${product.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-serif text-lg font-bold text-text-dark mt-1 line-clamp-1 hover:text-primary transition-colors duration-200"
                    >
                      {product.title}
                    </Link>

                    {/* Description excerpt */}
                    {product.description && (
                      <p className="mt-1 font-sans text-xs text-text-gray line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Pricing Logic based on Product Status & Currency */}
                    <div className="mt-3 pt-2">
                      {isLive ? (
                        /* LIVE: Show Selling Price & MRP formatted dynamically */
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-lg font-bold text-text-dark">
                            {formatPrice(sellingPrice)}
                          </span>
                          {mrp > sellingPrice && (
                            <span className="font-sans text-xs text-text-muted line-through">
                              {formatPrice(mrp)}
                            </span>
                          )}
                        </div>
                      ) : (
                        /* COMING SOON: NO PRICES SHOWN */
                        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary bg-lilac/40 border border-lilac-border px-2.5 py-1 rounded-md">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-5 pt-3 border-t border-lilac-border/60">
                    {isLive ? (
                      /* Live status button: ADD TO CART with smooth hover */
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart(product);
                          } else {
                            toastSuccess(`Added 1x ${product.title} to shopping bag.`);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-[#4A2D61] hover:scale-[1.02] text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm shadow-primary/20"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ADD TO CART</span>
                      </button>
                    ) : (
                      /* COMING SOON button: Opens Waitlist Modal with smooth hover */
                      <button
                        type="button"
                        onClick={() => onSelectProductForWaitlist(product.title)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-[#4A2D61] hover:scale-[1.02] text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm shadow-primary/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>COMING SOON</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
