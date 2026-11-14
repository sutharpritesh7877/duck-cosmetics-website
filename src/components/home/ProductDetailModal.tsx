"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Star,
  ShieldCheck,
  HeartHandshake,
  Clock,
  ArrowRight,
  ShoppingBag,
  Leaf,
  Info,
  CheckCircle,
} from "lucide-react";
import { DuckLogo } from "../ui/DuckLogo";
import { ProductItem } from "./ProductGrid";
import { useCurrency } from "@/context/CurrencyContext";

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenWaitlist: (productTitle: string) => void;
  onAddToCart?: (product: ProductItem) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onOpenWaitlist,
  onAddToCart,
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients" | "directions" | "safety" | "reviews">("overview");
  const { formatPrice } = useCurrency();

  const allImages = React.useMemo(() => {
    if (!product) return [];
    return [
      product.imageUrl,
      (product as any).backImageUrl,
      (product as any).textureImageUrl,
      (product as any).lifestyleImageUrl,
      ...((product as any).galleryImages || []),
    ].filter(Boolean) as string[];
  }, [product]);

  const [activeImage, setActiveImage] = useState<string>(product?.imageUrl || "");

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const isLive = product.status === "LIVE";
  const ratingValue = (product as any).rating || 4.9;
  const reviewCount = (product as any).reviewCount || 128;

  // Mock editorial reviews based on the product
  const reviews = [
    {
      author: "Camille D., Paris",
      rating: 5,
      date: "2 days ago",
      comment: "The sensory slip and finish are unlike anything else. Skin feels instantly cushioned, lit-from-within without any greasy residue.",
    },
    {
      author: "Evelyn K., New York",
      rating: 5,
      date: "1 week ago",
      comment: "A holy-grail formulation. The botanical aroma is subtle and pure luxury. Pre-launch formula sample exceeded all expectations.",
    },
    {
      author: "Sienna M., London",
      rating: 5,
      date: "2 weeks ago",
      comment: "Dermatologically tested and approved for my hyper-reactive skin. Redefined my entire everyday glow routine.",
    },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto"
        >
          {/* Top Bar with Logo & Close */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <DuckLogo variant="purple" className="h-8 w-26" />
              <span className="hidden sm:inline-block w-px h-4 bg-gray-200" />
              <span className="hidden sm:inline-block text-[11px] font-sans font-semibold uppercase tracking-widest text-text-muted">
                Formula Dossier
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-text-gray hover:text-text-dark hover:bg-lilac transition duration-200"
              aria-label="Close formula details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: Split 2 Columns on Desktop */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start">
              {/* Left Column: Product Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-lilac p-4 border border-lilac-border shadow-inner">
                  <Image
                    src={activeImage || product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover rounded-xl"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    {isLive ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm">
                        Available Now
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/95 text-primary text-[10px] font-sans font-bold uppercase tracking-wider border border-lilac-border shadow-sm">
                        Pre-Launch Allocation
                      </span>
                    )}
                  </div>
                </div>

                {/* Multiple Image Gallery Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                    {allImages.map((img, idx) => (
                      <button
                        key={`modal-thumb-${idx}`}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                          activeImage === img
                            ? "border-primary ring-2 ring-primary/20 scale-105"
                            : "border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-text-dark">
                  <div className="p-2.5 rounded-xl bg-lilac/70 border border-lilac-border flex items-center gap-2">
                    <HeartHandshake className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>100% Cruelty-Free</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-lilac/70 border border-lilac-border flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Dermatologist Tested</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Ratings, Details Tabs */}
              <div className="flex flex-col space-y-5">
                <div>
                  <span className="font-sans text-[11px] font-semibold tracking-widest text-text-gray uppercase">
                    {product.category?.name || "Pre-Launch Formula"}
                  </span>
                  <h2
                    id="product-detail-title"
                    className="font-serif text-2xl sm:text-3xl font-bold text-text-dark mt-1"
                  >
                    {product.title}
                  </h2>

                  {/* Rating Stars Section */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-sans text-xs font-bold text-text-dark">
                      {ratingValue}
                    </span>
                    <span className="text-xs text-text-muted">
                      ({reviewCount} verified VIP reviews)
                    </span>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1.5 border-b border-gray-100 overflow-x-auto pb-1 text-xs font-sans font-semibold uppercase tracking-wider">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-2 px-3 border-b-2 transition shrink-0 ${
                      activeTab === "overview"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-gray hover:text-text-dark"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("ingredients")}
                    className={`py-2 px-3 border-b-2 transition shrink-0 ${
                      activeTab === "ingredients"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-gray hover:text-text-dark"
                    }`}
                  >
                    Ingredients
                  </button>
                  <button
                    onClick={() => setActiveTab("directions")}
                    className={`py-2 px-3 border-b-2 transition shrink-0 ${
                      activeTab === "directions"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-gray hover:text-text-dark"
                    }`}
                  >
                    Ritual / How To
                  </button>
                  <button
                    onClick={() => setActiveTab("safety")}
                    className={`py-2 px-3 border-b-2 transition shrink-0 ${
                      activeTab === "safety"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-gray hover:text-text-dark"
                    }`}
                  >
                    Safety & Lab
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-2 px-3 border-b-2 transition shrink-0 ${
                      activeTab === "reviews"
                        ? "border-primary text-primary"
                        : "border-transparent text-text-gray hover:text-text-dark"
                    }`}
                  >
                    Reviews ({reviewCount})
                  </button>
                </div>

                {/* Tab Content Panels */}
                <div className="font-sans text-xs leading-relaxed text-text-gray min-h-[140px]">
                  {activeTab === "overview" && (
                    <div className="space-y-3">
                      <p className="text-sm text-text-dark font-medium">
                        {product.description}
                      </p>
                      <p>
                        Engineered with rare botanical extracts and cellular renewal peptides. Imbues skin with an ethereal, soft-focus luminescence without synthetic greasiness.
                      </p>
                      <div className="pt-2 flex items-center gap-3 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Non-comedogenic
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Vegan certified
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> 0% Parabens
                        </span>
                      </div>
                    </div>
                  )}

                  {activeTab === "ingredients" && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        Active Formulation Key Elements:
                      </p>
                      <p className="p-3.5 rounded-xl bg-lilac/70 border border-lilac-border font-mono text-[11px] text-text-dark leading-relaxed">
                        {(product as any).ingredients ||
                          "Aqua, Triple-Molecular Hyaluronic Acid, Niacinamide 5%, Centella Asiatica ferment, Camellia Sinensis extract, Rosa Damascena floral essence, Palmitoyl Peptides."}
                      </p>
                      <p className="text-[11px] text-text-muted italic">
                        Formulated without parabens, phthalates, synthetic sulfates, or animal by-products.
                      </p>
                    </div>
                  )}

                  {activeTab === "directions" && (
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        The Application Ritual:
                      </p>
                      <p className="p-3.5 rounded-xl bg-lilac/70 border border-lilac-border text-xs text-text-dark leading-relaxed">
                        {(product as any).directions ||
                          "Warm 3–4 drops between palms. Press gently onto freshly cleansed visage and neck each morning and evening. Allow 60 seconds to absorb before applying moisturizers."}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Pro Tip: Blend 1 drop into your foundation or cushion for an effortless glass-skin filter.
                      </p>
                    </div>
                  )}

                  {activeTab === "safety" && (
                    <div className="space-y-3">
                      <div>
                        <span className="font-bold text-text-dark block mb-1">
                          Warnings & Age Guidance:
                        </span>
                        <p className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 text-rose-800 text-[11px]">
                          {(product as any).warnings ||
                            "For external dermatological application only. Keep out of direct eye contact. Discontinue use if irritation occurs. Suitable for ages 16+."}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-text-dark block mb-1">
                          Formulation Provenance & Lab:
                        </span>
                        <p className="p-3 rounded-xl bg-lilac/70 border border-lilac-border text-[11px] text-text-dark">
                          {(product as any).manufacturer ||
                            "Duck Haute Parfumerie & Skincare Laboratory, 14 Rue des Roses, Grasse, France. Distributed by Duck Cosmetics Inc., London & New York."}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-3">
                      {reviews.map((rev, i) => (
                        <div key={i} className="p-3 rounded-xl bg-lilac/50 border border-lilac-border space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text-dark text-xs">{rev.author}</span>
                            <span className="text-[10px] text-text-muted">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                          <p className="text-[11px] text-text-gray mt-1">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTA Button */}
                <div className="pt-4 border-t border-gray-100">
                  {isLive ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onAddToCart?.(product);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary hover:bg-[#4A2D61] hover:scale-[1.01] text-white font-sans text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-md shadow-primary/10"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        ADD TO BAG · {formatPrice(product.sellingPrice ?? product.price ?? 0)}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenWaitlist(product.title);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-white font-sans text-xs font-semibold tracking-wider uppercase hover:bg-primary-hover transition shadow-md shadow-primary/10"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>JOIN WAITLIST FOR THIS FORMULA</span>
                    </button>
                  )}
                </div>

                {/* Direct Link to Full Product Detail Page */}
                <div className="pt-3 text-center">
                  <Link
                    href={`/product/${product.id}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-primary hover:text-primary-hover underline underline-offset-4 transition"
                  >
                    <span>View Full Botanical Dossier & Ritual Application</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
