"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  Eye,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
  ArrowLeft,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { ProductDetailModal } from "@/components/home/ProductDetailModal";
import { CustomerAuthModal } from "@/components/ui/CustomerAuthModal";
import { useToast } from "@/components/ui/Toast";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductItem } from "@/components/home/ProductGrid";
import { CategoryData, SiteSettingsData } from "@/lib/db";

interface ShopCollectionClientProps {
  currentCategory: CategoryData | null;
  allCategories: CategoryData[];
  initialProducts: any[];
  settings: SiteSettingsData;
}

export function ShopCollectionClient({
  currentCategory,
  allCategories,
  initialProducts,
  settings,
}: ShopCollectionClientProps) {
  const router = useRouter();
  const { info: toastInfo, success: toastSuccess } = useToast();

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
  const [likedProducts, setLikedProducts] = useState<Record<string, boolean>>({});

  // Modals state
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistProductTitle, setWaitlistProductTitle] = useState<string | undefined>(undefined);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAddToCartProduct, setPendingAddToCartProduct] = useState<ProductItem | null>(null);
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const { formatPrice } = useCurrency();

  // Read customer from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("duck_customer");
      if (stored) {
        setCustomer(JSON.parse(stored));
      }
    } catch {
      // ignore JSON errors
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

  // Subcategories belonging to the current main category
  const subcategories = useMemo<Array<{ id: string; name: string; slug: string; parentCategoryId?: string | null }>>(() => {
    if (!currentCategory) {
      // On Shop All, return main categories
      return allCategories.filter((c) => !c.parentCategoryId);
    }
    const directSubs = allCategories.filter((c) => c.parentCategoryId === currentCategory.id);
    if (directSubs.length > 0) return directSubs;

    // Fallback to subCategoriesList tags configured in Category Manager
    if (Array.isArray((currentCategory as any).subCategoriesList) && (currentCategory as any).subCategoriesList.length > 0) {
      return (currentCategory as any).subCategoriesList.map((tag: string) => ({
        id: tag.toLowerCase().replace(/\s+/g, "-"),
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, "-"),
      }));
    }

    return [];
  }, [currentCategory, allCategories]);

  // Filter products by subcategory and sort
  const displayedProducts = useMemo(() => {
    let list = (initialProducts || []).filter((p) => p.status !== "DRAFT");

    if (selectedSubcategory !== "ALL") {
      const sub = allCategories.find((c) => c.slug === selectedSubcategory || c.id === selectedSubcategory);
      if (sub) {
        list = list.filter((p) => p.categoryId === sub.id || p.categorySlug === sub.slug || p.categoryName?.toLowerCase() === sub.name.toLowerCase());
      } else {
        const cleanSub = selectedSubcategory.toLowerCase().replace(/-/g, " ");
        list = list.filter((p) =>
          (p.subCategory && p.subCategory.toLowerCase().includes(cleanSub)) ||
          (p.category && p.category.toLowerCase().includes(cleanSub)) ||
          (p.title && p.title.toLowerCase().includes(cleanSub)) ||
          (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(cleanSub)))
        );
      }
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.sellingPrice ?? a.price ?? 0) - (b.sellingPrice ?? b.price ?? 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.sellingPrice ?? b.price ?? 0) - (a.sellingPrice ?? a.price ?? 0));
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // featured
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [initialProducts, selectedSubcategory, sortBy, allCategories]);

  const collectionTitle = currentCategory ? `${currentCategory.name} Collection` : "All Formulations";
  const collectionDesc =
    currentCategory?.description ||
    "Clean, active botanical formulations, Ayurvedic nectars, and pediatric-tested infant care engineered for luminous results.";

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white">
      {/* 1. Announcement Bar */}
      <AnnouncementBar text={settings?.announcementBarText} />

      {/* 2. Header */}
      <Header
        onOpenWaitlist={() => {
          setWaitlistProductTitle(undefined);
          setWaitlistOpen(true);
        }}
        cartCount={cartCount}
        customer={customer}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main className="flex-grow">
        {/* Collection Hero Header with Dynamic Banner Image & Editorial Copy */}
        <div className="relative bg-[#F8F6FA] border-b border-lilac-border/80 py-10 sm:py-14 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-sans text-text-muted mb-4 uppercase tracking-wider">
              <Link href="/" className="hover:text-primary transition">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-primary transition">
                Shop
              </Link>
              {currentCategory && (
                <>
                  <span>/</span>
                  <span className="text-primary font-bold">{currentCategory.name}</span>
                </>
              )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className={currentCategory?.bannerImageUrl ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"}>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase mb-3 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Pre-Launch VIP Allocation</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-normal text-text-dark tracking-tight uppercase">
                  {collectionTitle}
                </h1>
                <p className="mt-3.5 font-sans text-sm sm:text-base text-text-gray leading-relaxed max-w-2xl">
                  {currentCategory?.shortDescription || collectionDesc}
                </p>
              </div>

              {currentCategory?.bannerImageUrl && (
                <div className="lg:col-span-5 relative w-full h-52 sm:h-64 rounded-3xl overflow-hidden shadow-lg border border-white">
                  <Image
                    src={currentCategory.bannerImageUrl}
                    alt={currentCategory.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(93, 58, 122, 0.4) 0%, transparent 60%)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="sticky top-20 sm:top-24 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Sub-Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubcategory("ALL")}
                className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-200 shrink-0 ${
                  selectedSubcategory === "ALL"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-[#F8F6FA] text-text-dark/80 hover:bg-lilac-subtle"
                }`}
              >
                {currentCategory ? `All ${currentCategory.name}` : "All Products"}
              </button>

              {subcategories.map((sub) => {
                const isSelected = selectedSubcategory === sub.slug;
                return (
                  <button
                    key={sub.id || sub.slug}
                    type="button"
                    onClick={() => {
                      if (!currentCategory) {
                        // If on Shop All, clicking a category routes to it
                        router.push(`/shop/${sub.slug}`);
                      } else {
                        setSelectedSubcategory(sub.slug);
                      }
                    }}
                    className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-200 shrink-0 ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "bg-[#F8F6FA] text-text-dark/80 hover:bg-lilac-subtle"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>

            {/* Right: Results Count & Sort By Dropdown */}
            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
              <span className="text-xs font-sans text-text-muted font-medium">
                {displayedProducts.length} {displayedProducts.length === 1 ? "Formula" : "Formulas"}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-text-muted hidden sm:inline-block">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#F8F6FA] border border-lilac-border rounded-xl px-3 py-2 text-xs font-sans font-semibold text-text-dark focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest Formulations</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <section className="py-12 sm:py-16 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 px-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border max-w-xl mx-auto">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-text-dark font-medium">
                No Formulations in this Selection
              </h3>
              <p className="font-sans text-sm text-text-gray mt-2 leading-relaxed">
                We are currently handcrafting micro-batches for this specific ritual. Try another filter or explore our full collection.
              </p>
              <button
                type="button"
                onClick={() => setSelectedSubcategory("ALL")}
                className="mt-6 px-6 py-2.5 rounded-full bg-primary text-white font-sans text-xs font-semibold tracking-wider uppercase hover:bg-primary-hover transition"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {displayedProducts.map((product, index) => {
                const isLive = product.status === "LIVE";
                const isLiked = likedProducts[product.id];
                const categoryName = product.categoryName || product.category?.name || "Pre-Launch Exclusive";
                const sellingPrice = product.sellingPrice ?? product.price ?? 0;
                const mrp = product.mrp ?? 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    whileHover={{ scale: 1.02 }}
                    className="group flex flex-col justify-between rounded-3xl bg-[#F8F6FA] p-4 sm:p-5 border border-lilac-border transition-all duration-300 hover:shadow-[0_12px_32px_rgba(93,58,122,0.14)] hover:border-primary/40"
                  >
                    {/* Top: 1:1 Aspect Ratio Image Container */}
                    <div
                      onClick={() => setDetailProduct(product)}
                      className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/70 flex items-center justify-center cursor-pointer group/img"
                    >
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover object-center group-hover/img:scale-105 transition-transform duration-500"
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
                        aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`w-4 h-4 transition ${
                            isLiked ? "fill-rose-500 text-rose-500" : "text-text-dark"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Middle: Details & Editorial Copy */}
                    <div className="mt-4 flex flex-col flex-grow">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-primary">
                          {categoryName}
                        </span>
                        {product.rating && (
                          <span className="text-[11px] font-sans text-text-muted flex items-center gap-1 font-medium">
                            ★ {Number(product.rating).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/product/${product.id}`}
                        className="font-serif text-lg font-bold text-text-dark hover:text-primary transition duration-200 line-clamp-1"
                        title={product.title}
                      >
                        {product.title}
                      </Link>

                      <p className="mt-1 font-sans text-xs text-text-gray line-clamp-2 leading-relaxed flex-grow">
                        {product.description}
                      </p>

                      {/* Pricing Logic (Multi-Currency Dynamic) */}
                      <div className="mt-3 pt-3 border-t border-lilac-border flex items-baseline justify-between">
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
                          <div className="flex flex-col">
                            <span className="font-serif text-xs font-semibold text-primary uppercase tracking-wider">
                              Price TBA · Pre-Release
                            </span>
                            <span className="font-sans text-[10px] text-text-muted">
                              Complimentary Global VIP Shipping
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action CTA Button */}
                    <div className="mt-4 pt-1">
                      {isLive ? (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-3 px-4 rounded-xl bg-primary text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] shadow-xs hover:shadow-md flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Bag</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenProductWaitlist(product.title)}
                          className="w-full py-3 px-4 rounded-xl bg-primary text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] shadow-xs hover:shadow-md flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-lilac" />
                          <span>Coming Soon</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Editorial Trust Statement */}
        <div className="border-t border-gray-100 bg-[#F8F6FA] py-12">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-sm text-text-dark uppercase">100% Cruelty-Free & Pediatric Verified</h4>
                <p className="font-sans text-xs text-text-gray mt-1 leading-relaxed">
                  Never tested on animals. Dermatologically evaluated on sensitive and reactive skin profiles.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-sm text-text-dark uppercase">Micro-Batch Atelier Craft</h4>
                <p className="font-sans text-xs text-text-gray mt-1 leading-relaxed">
                  Cold-pressed Kashmiri saffron and bio-fermented botanicals bottled in limited pre-launch editions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-bold text-sm text-text-dark uppercase">Pre-Launch Priority Guarantee</h4>
                <p className="font-sans text-xs text-text-gray mt-1 leading-relaxed">
                  Waitlist patrons receive guaranteed inaugural drop allocations and complimentary gifts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenWaitlist={() => {
          setWaitlistProductTitle(undefined);
          setWaitlistOpen(true);
        }}
        tagline={settings?.footerTagline}
      />

      {/* Modals */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        productTitle={waitlistProductTitle}
      />

      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onOpenWaitlist={handleOpenProductWaitlist}
        onAddToCart={handleAddToCart}
      />

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
            : "To access exclusive pre-launch allocations"
        }
      />
    </div>
  );
}