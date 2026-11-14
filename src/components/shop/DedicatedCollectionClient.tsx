"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Eye, Heart, ShoppingBag, Star, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { ProductDetailModal } from "@/components/home/ProductDetailModal";
import { CustomerAuthModal } from "@/components/ui/CustomerAuthModal";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductItem } from "@/components/home/ProductGrid";
import { SiteSettingsData } from "@/lib/db";

interface DedicatedCollectionClientProps {
  title: string;
  eyebrow: string;
  description: string;
  products: ProductItem[];
  settings: SiteSettingsData;
  emptyMessage?: string;
}

export function DedicatedCollectionClient({
  title,
  eyebrow,
  description,
  products,
  settings,
  emptyMessage = "No formulations currently available in this drop. Check back soon for upcoming reveals.",
}: DedicatedCollectionClientProps) {
  const { info: toastInfo, success: toastSuccess } = useToast();
  const { formatPrice } = useCurrency();

  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistProductTitle, setWaitlistProductTitle] = useState<string | undefined>(undefined);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAddToCartProduct, setPendingAddToCartProduct] = useState<ProductItem | null>(null);
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("duck_customer");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.isGuest || parsed?.name === "VIP Guest") {
          localStorage.removeItem("duck_customer");
          setCustomer(null);
        } else {
          setCustomer(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLike = (productId: string) => {
    setLikedProducts((prev) => {
      const nextState = !prev[productId];
      if (nextState) {
        toastInfo("Added formula to your private wishlist.");
      }
      return { ...prev, [productId]: nextState };
    });
  };

  const handleOpenGeneralWaitlist = () => {
    setWaitlistProductTitle(undefined);
    setWaitlistOpen(true);
  };

  const handleOpenProductWaitlist = (productTitle: string) => {
    setWaitlistProductTitle(productTitle);
    setWaitlistOpen(true);
  };

  const handleAddToCart = (product: ProductItem) => {
    if (!customer) {
      setPendingAddToCartProduct(product);
      setAuthModalOpen(true);
      return;
    }
    setCartCount((prev) => prev + 1);
    toastSuccess(`Added 1x ${product.title} to your bag.`);
  };

  const handleAuthSuccess = (loggedCustomer: { name: string; email: string }) => {
    setCustomer(loggedCustomer);
    if (pendingAddToCartProduct) {
      setCartCount((prev) => prev + 1);
      toastSuccess(`Added 1x ${pendingAddToCartProduct.title} to your bag.`);
      setPendingAddToCartProduct(null);
    }
  };

  const visibleProducts = products.filter((p) => p.status !== "DRAFT");

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white">
      {/* 1. Announcement Bar */}
      <AnnouncementBar text={settings?.announcementBarText} />

      {/* 2. Header */}
      <Header
        onOpenWaitlist={handleOpenGeneralWaitlist}
        cartCount={cartCount}
        customer={customer}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-grow">
        {/* Curated Collection Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF7FC] via-white to-white pt-14 pb-12 border-b border-lilac-border/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lilac border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase mb-4 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{eyebrow}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-text-dark tracking-tight uppercase"
            >
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="mt-4 max-w-2xl mx-auto font-sans text-sm sm:text-base text-text-gray leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex items-center justify-center gap-2 text-xs font-sans text-text-muted"
            >
              <span>{visibleProducts.length} Exclusive Formulations</span>
              <span>·</span>
              <span className="text-primary font-medium">Pre-Launch Drop Active</span>
            </motion.div>
          </div>
        </div>

        {/* Product Grid Section */}
        <section className="py-16 sm:py-20 bg-white font-sans">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            {visibleProducts.length === 0 ? (
              <div className="text-center py-20 px-4 rounded-3xl bg-lilac border border-lilac-border max-w-xl mx-auto">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-text-dark">Drop Preparation in Progress</h3>
                <p className="font-sans text-sm text-text-gray mt-2 leading-relaxed">
                  {emptyMessage}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#4A2D61] transition"
                  >
                    <span>Browse All Creations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {visibleProducts.map((product, index) => {
                  const isLive = product.status === "LIVE";
                  const isLiked = likedProducts[product.id];
                  const categoryName = product.category?.name || "Pre-Launch Exclusive";
                  const sellingPrice = product.sellingPrice ?? product.price ?? 0;
                  const mrp = product.mrp ?? 0;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                        delay: Math.min(index * 0.05, 0.4),
                      }}
                      whileHover={{ y: -8 }}
                      className="group flex flex-col justify-between rounded-3xl bg-[#F8F6FA] p-4 sm:p-5 border border-lilac-border transition-all duration-400 hover:shadow-[0_20px_45px_rgba(93,58,122,0.16)] hover:border-primary/50"
                    >
                      {/* 1:1 Aspect Ratio Image Container */}
                      <div
                        onClick={() => setDetailProduct(product)}
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

                      {/* Middle Content */}
                      <div
                        onClick={() => setDetailProduct(product)}
                        className="mt-4 flex flex-col flex-grow cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[11px] font-semibold tracking-widest text-text-gray uppercase truncate max-w-[170px]">
                            {categoryName}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{product.rating ?? 4.9}</span>
                          </div>
                        </div>

                        <Link
                          href={`/product/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-serif text-lg font-bold text-text-dark mt-1 line-clamp-1 hover:text-primary transition-colors duration-200"
                        >
                          {product.title}
                        </Link>

                        {product.description && (
                          <p className="mt-1 font-sans text-xs text-text-gray line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-3 pt-2">
                          {isLive ? (
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
                            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-primary bg-white/80 border border-lilac-border px-2.5 py-0.5 rounded-md">
                              Price TBA · Pre-Release
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Button */}
                      <div className="mt-5 pt-3 border-t border-lilac-border/60">
                        {isLive ? (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-[#4A2D61] hover:scale-[1.02] text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm shadow-primary/20"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>ADD TO CART</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenProductWaitlist(product.title)}
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
      </main>

      {/* Footer */}
      <Footer onOpenWaitlist={handleOpenGeneralWaitlist} tagline={settings?.footerTagline} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onOpenWaitlist={handleOpenProductWaitlist}
        onAddToCart={handleAddToCart}
      />

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAddToCartProduct(null);
        }}
        onSuccess={handleAuthSuccess}
        promptAction={
          pendingAddToCartProduct
            ? `To reserve ${pendingAddToCartProduct.title} in your bag`
            : "To access your VIP beauty perks"
        }
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        productTitle={waitlistProductTitle}
        source={waitlistProductTitle ? `Drop Modal: ${waitlistProductTitle}` : `${title} Waitlist`}
      />
    </div>
  );
}
