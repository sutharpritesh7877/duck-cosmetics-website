"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  ShoppingBag,
  Eye,
  Star,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/components/ui/Toast";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { ProductDetailModal } from "@/components/home/ProductDetailModal";
import { ProductItem } from "@/components/home/ProductGrid";

export default function AccountWishlistPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistTitle, setWaitlistTitle] = useState<string | undefined>(undefined);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);

  const { formatPrice } = useCurrency();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/account/wishlist");
      const data = await res.json();
      if (data.success && Array.isArray(data.wishlist)) {
        setProducts(data.wishlist);
      }
    } catch {
      toastError("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string, productTitle: string) => {
    try {
      const res = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        toastInfo(`Removed "${productTitle}" from your wishlist.`);
      }
    } catch {
      toastError("Error updating wishlist.");
    }
  };

  const handleOpenWaitlist = (title: string) => {
    setWaitlistTitle(title);
    setWaitlistOpen(true);
  };

  const handleAddToCart = (product: ProductItem) => {
    toastSuccess(`Added 1x ${product.title} to your bag.`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-text-dark font-normal">
            My Curated Wishlist
          </h2>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Personal vault of desired botanicals and limited drop formulas.
          </p>
        </div>
        <span className="text-xs font-semibold text-text-muted self-start sm:self-auto">
          {products.length} Formulations Saved
        </span>
      </div>

      {/* Grid or Empty */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-4 rounded-3xl bg-[#F8F6FA] border border-lilac-border animate-pulse h-80"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-sm border border-lilac-border">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-text-dark">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs sm:text-sm text-text-gray mt-2 leading-relaxed max-w-sm mx-auto">
            Explore our collections and tap the heart icon on any formula to curate your bespoke private repertoire.
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
            >
              <span>Explore Formulations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isLive = product.status === "LIVE";
            const sellingPrice = product.sellingPrice ?? product.price ?? 0;
            const mrp = product.mrp ?? 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col justify-between rounded-3xl bg-[#F8F6FA] p-4 border border-lilac-border transition-all duration-300 hover:shadow-lg hover:border-primary/40"
              >
                {/* 1:1 Image */}
                <div
                  onClick={() => setDetailProduct(product)}
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-lilac-subtle flex items-center justify-center cursor-pointer group/img"
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(product.id, product.title);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-xs z-10"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute top-2.5 left-2.5">
                    {isLive ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                        Available
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-primary text-[9px] font-bold uppercase tracking-wider border border-lilac-border shadow-2xs">
                        Pre-Launch
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-3 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                      <span className="uppercase tracking-widest truncate max-w-[140px]">
                        {product.category?.name || "Atelier Formula"}
                      </span>
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{product.rating ?? 4.9}</span>
                      </div>
                    </div>

                    <Link
                      href={`/product/${product.id}`}
                      className="font-serif text-base font-bold text-text-dark mt-1 line-clamp-1 hover:text-primary transition"
                    >
                      {product.title}
                    </Link>

                    {product.description && (
                      <p className="text-xs text-text-gray line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2">
                    {isLive ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-base font-bold text-text-dark">
                          {formatPrice(sellingPrice)}
                        </span>
                        {mrp > sellingPrice && (
                          <span className="text-xs text-text-muted line-through">
                            {formatPrice(mrp)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-white/80 border border-lilac-border px-2 py-0.5 rounded">
                        Price TBA · Pre-Release
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 border-t border-lilac-border/60">
                  {isLive ? (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add To Cart</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenWaitlist(product.title)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Join Drop Waitlist</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onOpenWaitlist={(title) => handleOpenWaitlist(title)}
        onAddToCart={handleAddToCart}
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        productTitle={waitlistTitle}
        source={waitlistTitle ? `Wishlist Modal: ${waitlistTitle}` : "Wishlist Page"}
      />
    </div>
  );
}
