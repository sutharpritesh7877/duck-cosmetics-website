"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGrid, ProductItem } from "@/components/home/ProductGrid";
import { ProductDetailModal } from "@/components/home/ProductDetailModal";
import { CustomerAuthModal } from "@/components/ui/CustomerAuthModal";
import { OurStorySection } from "@/components/home/OurStorySection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { Footer } from "@/components/layout/Footer";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { SiteSettingsData, ProductData, ContactSettingsData } from "@/lib/db";
import { useToast } from "@/components/ui/Toast";

interface DuckStoreClientProps {
  initialSettings: SiteSettingsData;
  initialProducts: ProductData[];
  initialContact?: ContactSettingsData;
}

export function DuckStoreClient({
  initialSettings,
  initialProducts,
  initialContact,
}: DuckStoreClientProps) {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistProductTitle, setWaitlistProductTitle] = useState<string | undefined>(undefined);
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAddToCartProduct, setPendingAddToCartProduct] = useState<ProductItem | null>(null);
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | undefined>(undefined);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const router = useRouter();
  const { success: toastSuccess } = useToast();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("auth") === "login") {
          setAuthModalOpen(true);
        }
        if (params.get("callbackUrl")) {
          setCallbackUrl(params.get("callbackUrl"));
        }
      }

      const stored = localStorage.getItem("duck_customer");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Cleanse legacy guest sessions so they don't appear as authenticated VIPs
        if (parsed?.isGuest || parsed?.name === "VIP Guest") {
          localStorage.removeItem("duck_customer");
          setCustomer(null);
        } else {
          setCustomer(parsed);
        }
      }
    } catch {
      // ignore JSON errors
    }
  }, []);

  const handleOpenGeneralWaitlist = () => {
    setWaitlistProductTitle(undefined);
    setWaitlistOpen(true);
  };

  const handleOpenProductWaitlist = (productTitle: string) => {
    setWaitlistProductTitle(productTitle);
    setWaitlistOpen(true);
  };

  const handleSelectProductForDetails = (product: ProductItem) => {
    setDetailProduct(product);
  };

  const handleAddToCart = (product: ProductItem) => {
    // If user is not logged in, prompt authentication first per user requirement:
    // "and any person click buy a product and add to bag click than first oaption say login and sighnup show"
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
    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }
    if (pendingAddToCartProduct) {
      setCartCount((prev) => prev + 1);
      toastSuccess(`Added 1x ${pendingAddToCartProduct.title} to your bag.`);
      setPendingAddToCartProduct(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white">
      {/* 1. Announcement Bar (Top of page, deep purple background, white text) */}
      <AnnouncementBar text={initialSettings?.announcementBarText} />

      {/* 2. Sticky Header with official brand logo, dynamic cart counter, and VIP customer status */}
      <Header
        onOpenWaitlist={handleOpenGeneralWaitlist}
        cartCount={cartCount}
        customer={customer}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* 3. Hero Section (50/50 split layout, "REDEFINE YOUR GLOW", editorial model image, trust badges) */}
        <HeroSection
          headline={initialSettings?.heroHeadline}
          subheadline={initialSettings?.heroSubheadline}
          imageUrl={initialSettings?.heroImageUrl}
          onOpenWaitlist={handleOpenGeneralWaitlist}
        />

        {/* 4. Product Grid ("OUR BEST SELLERS", 4-col, 1:1 lilac cards, Coming Soon modal, clickable formula dossier) */}
        <ProductGrid
          products={initialProducts as ProductItem[]}
          onSelectProductForWaitlist={handleOpenProductWaitlist}
          onSelectProductForDetails={handleSelectProductForDetails}
          onAddToCart={handleAddToCart}
          selectedCategorySlug={selectedCategorySlug}
        />

        {/* 5. Client Testimonials & Reviews Section */}
        <ReviewsSection />

        {/* 6. Editorial Brand Story */}
        <OurStorySection onOpenWaitlist={handleOpenGeneralWaitlist} />
      </main>

      {/* 6. Footer (Deep purple background, official white logo, 4 columns, social links, newsletter, dynamic contact) */}
      <Footer
        onOpenWaitlist={handleOpenGeneralWaitlist}
        tagline={initialSettings?.footerTagline}
        contact={initialContact}
      />

      {/* 7. Product Formula Dossier / Detail Modal (Ingredients, Ritual, Warnings, Manufacturer, Ratings) */}
      <ProductDetailModal
        product={detailProduct}
        isOpen={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onOpenWaitlist={handleOpenProductWaitlist}
        onAddToCart={handleAddToCart}
      />

      {/* 8. Customer Auth Modal (Triggered on Add to Bag or Header User Login) */}
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

      {/* 9. Framer Motion Waitlist Modal with Zod Validation */}
      <WaitlistModal
        isOpen={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        productTitle={waitlistProductTitle}
        source={waitlistProductTitle ? `Product Modal: ${waitlistProductTitle}` : "Hero CTA"}
      />
    </div>
  );
}
