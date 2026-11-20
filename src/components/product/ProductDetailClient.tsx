"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Truck,
  ArrowRight,
  ChevronDown,
  Share2,
  Check,
  CheckCircle2,
  MessageSquare,
  Lock,
} from "lucide-react";
import { ProductData } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/components/ui/Toast";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface ProductDetailClientProps {
  product: ProductData;
  relatedProducts: ProductData[];
}

export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { success: toastSuccess } = useToast();

  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Collect all gallery photos into an array
  const allImages = useMemo(() => {
    return [
      product.imageUrl,
      product.backImageUrl,
      product.textureImageUrl,
      product.lifestyleImageUrl,
      ...(product.galleryImages || []),
    ].filter(Boolean) as string[];
  }, [product]);

  const [activeImage, setActiveImage] = useState<string>(allImages[0] || product.imageUrl);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>("ingredients");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const isLive = product.status === "LIVE";
  const ratingValue = product.rating || 4.9;
  const reviewCount = product.reviewCount || 128;
  const mrp = product.mrp ?? product.price;
  const sellingPrice = product.sellingPrice ?? product.price;
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // Handle Share link
  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: `${product.title} | Duck Cosmetics`,
          text: product.description,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toastSuccess("Formula link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  // Editorial Connoisseur Reviews
  const editorialReviews = [
    {
      id: "rev-1",
      author: "Camille D.",
      city: "Paris",
      rating: 5,
      date: "3 days ago",
      verified: true,
      comment:
        "The sensory slip and finish are unlike anything else. Skin feels instantly cushioned, lit-from-within without any greasy residue. An exceptional formulation.",
    },
    {
      id: "rev-2",
      author: "Evelyn K.",
      city: "New York",
      rating: 5,
      date: "1 week ago",
      verified: true,
      comment:
        "A holy-grail formulation. The botanical aroma is subtle and pure luxury. The small-batch sample exceeded all expectations.",
    },
    {
      id: "rev-3",
      author: "Dr. Ananya P.",
      city: "Mumbai",
      rating: 5,
      date: "2 weeks ago",
      verified: true,
      comment:
        "Dermatologically tested and approved for my reactive skin. Blends classical Ayurvedic kumkumadi wisdom with modern bio-actives seamlessly.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16 font-sans">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary transition">
          Collections
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/shop/${product.category.slug || "all"}`}
              className="hover:text-primary transition"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-text-dark font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Multi-Image Interactive Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <ErrorBoundary sectionName="Image Gallery">
            {/* Primary Main Image Frame */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-lilac/30 border border-lilac-border shadow-xs group">
              <Image
                src={activeImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Status Badge */}
              <div className="absolute top-5 left-5">
                {isLive ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                    Available Now
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-primary text-[11px] font-bold uppercase tracking-wider border border-lilac-border shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Pre-Launch VIP Allocation</span>
                  </span>
                )}
              </div>

              {discountPercent > 0 && (
                <div className="absolute top-5 right-5">
                  <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold tracking-wider shadow-sm">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Switcher (if more than 1 image) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={`pdp-thumb-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition duration-200 ${
                      activeImage === img
                        ? "border-primary ring-2 ring-primary/20 scale-105 shadow-xs"
                        : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} view ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Atelier Trust Guarantee Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 text-text-dark">
              <div className="p-3 rounded-2xl bg-lilac/30 border border-lilac-border/60 text-center space-y-1">
                <HeartHandshake className="w-4 h-4 text-primary mx-auto" />
                <span className="text-[11px] font-bold block">100% Cruelty-Free</span>
                <span className="text-[10px] text-text-muted block">PETA Certified</span>
              </div>
              <div className="p-3 rounded-2xl bg-lilac/30 border border-lilac-border/60 text-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-primary mx-auto" />
                <span className="text-[11px] font-bold block">Dermatologist Tested</span>
                <span className="text-[10px] text-text-muted block">Clinical Grade</span>
              </div>
              <div className="p-3 rounded-2xl bg-lilac/30 border border-lilac-border/60 text-center space-y-1">
                <Sparkles className="w-4 h-4 text-primary mx-auto" />
                <span className="text-[11px] font-bold block">Pure Botanicals</span>
                <span className="text-[10px] text-text-muted block">Ayurvedic Actives</span>
              </div>
              <div className="p-3 rounded-2xl bg-lilac/30 border border-lilac-border/60 text-center space-y-1">
                <Truck className="w-4 h-4 text-primary mx-auto" />
                <span className="text-[11px] font-bold block">Express Dispatch</span>
                <span className="text-[10px] text-text-muted block">Ahmedabad Atelier</span>
              </div>
            </div>
          </ErrorBoundary>
        </div>

        {/* Right Column: Formulation Dossier & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header & Title */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              {product.categoryName || "Haute Formulation"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark leading-tight">
              {product.title}
            </h1>

            {/* Star Rating & Review Link */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-text-dark">{ratingValue.toFixed(1)}</span>
              <span className="text-xs text-text-muted">
                ({reviewCount} verified connoisseur reviews)
              </span>
            </div>
          </div>

          {/* Pricing & Value */}
          <div className="flex items-baseline gap-3 pt-1 pb-2">
            {isLive ? (
              <>
                <span className="font-serif text-3xl font-bold text-primary">
                  {formatPrice(sellingPrice)}
                </span>
                {mrp > sellingPrice && (
                  <span className="text-sm font-sans text-text-muted line-through">
                    {formatPrice(mrp)}
                  </span>
                )}
                <span className="text-[11px] text-text-muted">
                  (Includes all domestic taxes · Free shipping over ₹800)
                </span>
              </>
            ) : (
              <span className="inline-block text-base font-bold uppercase tracking-wider text-primary bg-lilac/40 border border-lilac-border px-4 py-2 rounded-xl">
                Coming Soon
              </span>
            )}
          </div>

          {/* Sensorial Description */}
          <p className="text-xs sm:text-sm text-text-gray leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Allocation Urgency Bar */}
          <div className="p-3.5 rounded-2xl bg-lilac/40 border border-lilac-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-text-dark font-medium">
                Small-Batch Drop: <strong>Only {product.stock || 45} units allocated</strong>
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
              Batch #DK-2026
            </span>
          </div>

          {/* Primary CTA Button */}
          <div className="space-y-3 pt-2">
            {isLive ? (
              <button
                type="button"
                onClick={() =>
                  addItem({
                    id: product.id,
                    title: product.title,
                    price: sellingPrice,
                    sellingPrice,
                    imageUrl: product.imageUrl,
                    categoryName: product.categoryName,
                  })
                }
                className="w-full py-4 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Add Formulation to Bag</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setWaitlistOpen(true)}
                className="w-full py-4 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Reserve VIP Drop Allocation</span>
              </button>
            )}

            {/* Secondary Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3 rounded-full bg-white border border-gray-200 text-xs font-semibold uppercase tracking-wider text-text-dark hover:bg-lilac transition flex items-center justify-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-text-muted" />
                  <span>Share This Formula</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable Luxury Accordions */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {/* Accordion 1: Key Ingredients */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion("ingredients")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-lilac/20 transition"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-text-dark">
                  Key Ingredients & Botanical Dossier
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                    openAccordion === "ingredients" ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openAccordion === "ingredients" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 text-xs text-text-gray leading-relaxed space-y-2 border-t border-gray-100 bg-lilac/10">
                      <p>
                        {product.ingredients ||
                          "Hand-infused Kumkumadi Thailam, Cold-Pressed Saffron Stigmas, Bulgarian Rose Water, Niacinamide (5%), Hyaluronic Acid triple molecular complex, Centella Asiatica."}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Zero parabens · Zero phthalates · 100% Vegan & Cruelty-Free.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 2: How to Use */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion("howToUse")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-lilac/20 transition"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-text-dark">
                  How to Use & Ritual Application
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                    openAccordion === "howToUse" ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openAccordion === "howToUse" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 text-xs text-text-gray leading-relaxed space-y-2 border-t border-gray-100 bg-lilac/10">
                      <p>
                        {product.directions ||
                          "Dispense 3–4 drops onto warm fingertips. Inhale the calming botanical bouquet, then gently press into cleansed face, neck, and décolletage in upward sweeping motions. Best used morning and evening before ritual cushion cream."}
                      </p>
                      {product.warnings && (
                        <p className="text-[11px] text-amber-700 font-medium">
                          Note: {product.warnings}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion 3: Shipping & Returns */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion("shipping")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-lilac/20 transition"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-text-dark">
                  Shipping, Delivery & Returns
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                    openAccordion === "shipping" ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openAccordion === "shipping" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 text-xs text-text-gray leading-relaxed space-y-2 border-t border-gray-100 bg-lilac/10">
                      <p>
                        • <strong>Complimentary Shipping:</strong> On all domestic orders exceeding ₹800.
                      </p>
                      <p>
                        • <strong>Express Dispatch:</strong> Ships in custom insured presentation box within 24 hours from Ahmedabad atelier.
                      </p>
                      <p>
                        • <strong>14-Day Guarantee:</strong> If our formulation does not transform your glow, enjoy hassle-free returns.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Connoisseur Reviews Section */}
      <section className="mt-20 pt-16 border-t border-gray-200">
        <ErrorBoundary sectionName="Customer Reviews">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Connoisseur Testimonials
            </span>
            <h2 className="font-serif text-3xl font-normal text-text-dark">
              Ritual Feedback & Verified Reviews
            </h2>
            <div className="flex items-center justify-center gap-2 pt-1">
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-bold text-text-dark">
                {ratingValue.toFixed(1)} Out of 5 Stars
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editorialReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-text-dark leading-relaxed font-sans italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-serif font-bold text-text-dark block">
                      {rev.author}
                    </span>
                    <span className="text-[11px] text-text-muted">{rev.city}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Ritualist</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ErrorBoundary>
      </section>

      {/* Complementary Recommendations */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Complete Your Ritual
              </span>
              <h3 className="font-serif text-2xl font-bold text-text-dark">
                Complementary Formulations
              </h3>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <Link
                key={`related-${rel.id}`}
                href={`/product/${rel.id}`}
                className="group block bg-white rounded-3xl p-4 border border-lilac-border hover:shadow-md transition duration-300"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-lilac/40 mb-3">
                  <Image
                    src={rel.imageUrl}
                    alt={rel.title}
                    fill
                    sizes="250px"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <span className="text-[10px] uppercase font-bold text-text-muted block">
                  {rel.categoryName}
                </span>
                <h4 className="font-serif text-sm font-bold text-text-dark truncate mt-0.5 group-hover:text-primary transition">
                  {rel.title}
                </h4>
                <span className="text-xs font-bold text-primary block mt-1">
                  {formatPrice(rel.sellingPrice ?? rel.price)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        productTitle={product.title}
      />
    </div>
  );
}
