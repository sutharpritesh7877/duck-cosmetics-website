"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { DuckLogo } from "@/components/ui/DuckLogo";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  onOpenWaitlist?: () => void;
  cartCount?: number;
  customer?: { name: string; email: string } | null;
  onOpenAuth?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
}

interface NavCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  bannerImageUrl?: string;
  subCategoriesList?: string[];
  subCategories?: any[];
  displayOrder?: number;
  parentCategoryId?: string | null;
}

interface MegaMenuPromoData {
  badgeText: string;
  title: string;
  description: string;
  posterImageUrl: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  isActive: boolean;
}

const DEFAULT_MAIN_CATEGORIES: NavCategory[] = [
  { id: "cat-1", name: "Skincare", slug: "skincare", shortDescription: "Clean active botanicals & cellular hydrators", subCategoriesList: ["Serums & Oils", "Moisturizers", "Cleansers", "Masks"], displayOrder: 1 },
  { id: "cat-5", name: "Baby Care", slug: "baby-care", shortDescription: "Pediatric-tested hypoallergenic soothing care", subCategoriesList: ["Gentle Wash", "Nourishing Butter", "Soothing Balm"], displayOrder: 2 },
  { id: "cat-6", name: "Ayurvedic", slug: "ayurvedic", shortDescription: "Classical Kashmiri saffron & sandalwood infusions", subCategoriesList: ["Kumkumadi Oils", "Ubtan Polishes", "Elixirs"], displayOrder: 3 },
  { id: "cat-7", name: "Makeup", slug: "makeup", shortDescription: "High-fashion velvet cushion tints & glow drops", subCategoriesList: ["Lip Oils", "Cushion Tints", "Luminizers"], displayOrder: 4 },
  { id: "cat-8", name: "Haircare", slug: "haircare", shortDescription: "Botanical scalp recovery & silk protein oils", subCategoriesList: ["Scalp Tonics", "Silk Oils", "Hair Masks"], displayOrder: 5 },
];

export function Header({
  onOpenWaitlist,
  cartCount = 0,
  customer = null,
  onOpenAuth,
  onSelectCategory,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [shopMegaOpen, setShopMegaOpen] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>(DEFAULT_MAIN_CATEGORIES);
  const [promo, setPromo] = useState<MegaMenuPromoData>({
    badgeText: "THE NEW LAUNCH",
    title: "THE VELVET LIP OIL COLLECTION",
    description: "Formulated with French lavender extract & botanical peptides for high-shine luminescence.",
    posterImageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop",
    primaryButtonText: "EXPLORE FORMULA",
    primaryButtonLink: "/shop/lips",
    secondaryButtonText: "JOIN VIP WAITLIST",
    secondaryButtonLink: "#waitlist",
    isActive: true,
  });
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { openCart, cartCount: contextCartCount } = useCart();
  const displayCartCount = cartCount !== undefined && cartCount > 0 ? cartCount : contextCartCount;

  // Dynamically fetch categories and mega-menu promo from database API
  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : (Array.isArray(data.categories) ? data.categories : []);
          if (list.length > 0) {
            setCategories(list);
          }
        }
      })
      .catch((err) => {
        console.warn("Categories fetch fallback:", err);
      });

    fetch("/api/mega-menu-promo")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          const promoObj = data?.promo || data;
          if (promoObj && promoObj.title) {
            setPromo(promoObj);
          }
        }
      })
      .catch((err) => {
        console.warn("Mega menu promo fetch fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll listener for sticky header drop shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    setShopMegaOpen(false);
    if (sectionId) {
      if (pathname === "/") {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      router.push(`/#${sectionId}`);
      return;
    }
    router.push(href);
  };

  const handleCategoryNavigate = (slug: string) => {
    setShopMegaOpen(false);
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    router.push(`/shop/${slug}`);
  };

  const handleMouseEnterShop = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setShopMegaOpen(true);
  };

  const handleMouseLeaveShop = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setShopMegaOpen(false);
    }, 220);
  };

  // Group categories into primary main collections sorted by displayOrder
  const mainCategories = [...categories]
    .filter((c) => !c.parentCategoryId)
    .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  const subCategories = categories.filter((c) => Boolean(c.parentCategoryId));

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        scrolled
          ? "shadow-[0_4px_24px_rgba(93,58,122,0.08)] border-b border-gray-200/80 bg-white/98 backdrop-blur-md"
          : "border-b border-gray-100"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 sm:h-24 flex items-center justify-between gap-6">
        {/* Left: Minimal 3-Line Hamburger Menu (< 768px) + Brand Logo (Deep Purple #5D3A7A, Vertically Centered) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-lg text-text-dark hover:bg-lilac transition duration-200 flex items-center justify-center focus:outline-none"
            aria-label="Open mobile navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>

          <Link
            href="/"
            className="flex items-center select-none"
            aria-label="Duck Cosmetics Home"
          >
            {/* The exact original Deep Purple (#5D3A7A) logo rendered crisp and vertically centered */}
            <DuckLogo
              className="h-10 sm:h-11 w-auto max-w-[160px] transition-transform duration-200 hover:opacity-90"
              priority
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Consistent gap-6, breathing room ml-8/ml-10 from logo, text-sm tracking-wide) */}
        <nav
          className="hidden lg:flex items-center gap-6 xl:gap-7 justify-center ml-8 xl:ml-10"
          aria-label="Main Navigation"
        >
          {/* 1. HOME */}
          <button
            type="button"
            onClick={() => handleNavClick("/")}
            className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap py-1.5 inline-flex items-center"
          >
            <span>HOME</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out group-hover:w-full" />
          </button>

          {/* 2. SHOP with Animated Framer Motion Mega-Menu Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnterShop}
            onMouseLeave={handleMouseLeaveShop}
          >
            <button
              type="button"
              onClick={() => handleNavClick("/shop")}
              className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap inline-flex items-center gap-1.5 py-1.5"
              aria-expanded={shopMegaOpen}
            >
              <span>SHOP</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-250 ${
                  shopMegaOpen ? "rotate-180 text-primary" : "text-text-muted group-hover:text-primary"
                }`}
              />
              <span className={`absolute bottom-0 left-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out ${
                shopMegaOpen ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </button>

            {/* Mega-Menu Dropdown (fade in + slide down smoothly using Framer Motion) */}
            <AnimatePresence>
              {shopMegaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.985 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute top-full -left-20 mt-3 ${promo.isActive ? "w-[760px]" : "w-[600px]"} bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(93,58,122,0.15)] border border-lilac-border ring-1 ring-black/5 z-50 grid grid-cols-12 gap-6`}
                >
                  {/* Category Directory */}
                  <div className={`${promo.isActive ? "col-span-8" : "col-span-12"} space-y-4`}>
                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Curated Collections</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShopMegaOpen(false);
                          router.push("/shop");
                        }}
                        className="text-[11px] font-semibold text-text-muted hover:text-primary transition uppercase tracking-wider flex items-center gap-1"
                      >
                        <span>Shop All</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {mainCategories.map((cat) => {
                        const directSubs: string[] = (Array.isArray(cat.subCategoriesList) && cat.subCategoriesList.length > 0)
                          ? cat.subCategoriesList
                          : (Array.isArray(cat.subCategories) && cat.subCategories.length > 0)
                          ? cat.subCategories.map((s: any) => (typeof s === "string" ? s : s.name))
                          : subCategories.filter((s) => s.parentCategoryId === cat.id).map((s) => s.name);

                        return (
                          <div
                            key={cat.id || cat.slug}
                            className="p-3.5 rounded-2xl bg-[#F8F6FA] hover:bg-lilac/70 transition duration-150 flex flex-col justify-between"
                          >
                            <div>
                              <button
                                type="button"
                                onClick={() => handleCategoryNavigate(cat.slug)}
                                className="text-left group/item flex items-center justify-between w-full"
                              >
                                <span className="font-serif font-bold text-sm text-text-dark group-hover/item:text-primary transition">
                                  {cat.name}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover/item:text-primary group-hover/item:translate-x-0.5 transition" />
                              </button>
                              {(cat.shortDescription || cat.description) && (
                                <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">
                                  {cat.shortDescription || cat.description}
                                </p>
                              )}
                            </div>

                            {directSubs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-lilac-border/60">
                                {directSubs.map((sub, sIdx) => (
                                  <button
                                    key={sIdx}
                                    type="button"
                                    onClick={() => {
                                      setShopMegaOpen(false);
                                      router.push(`/shop/${cat.slug}?subcategory=${encodeURIComponent(sub)}`);
                                    }}
                                    className="text-[10px] font-sans font-medium text-text-muted hover:text-primary hover:bg-white px-1.5 py-0.5 rounded transition"
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editorial Promo Card (4 cols) */}
                  {promo.isActive && (
                    <div className="col-span-4 rounded-2xl relative overflow-hidden flex flex-col justify-end p-5 text-white shadow-xl group min-h-[340px]">
                      {/* Background Image */}
                      {promo.posterImageUrl ? (
                        <Image
                          src={promo.posterImageUrl}
                          alt={promo.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-primary/40" />
                      )}

                      {/* Luxury Deep Purple & Vignette Gradient Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(93, 58, 122, 0.95) 0%, rgba(93, 58, 122, 0.6) 55%, rgba(93, 58, 122, 0.2) 100%)",
                        }}
                      />

                      {/* Content */}
                      <div className="relative z-10 space-y-2.5">
                        {promo.badgeText && (
                          <span className="inline-block text-[9px] font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30">
                            {promo.badgeText}
                          </span>
                        )}

                        <h4 className="font-serif text-base sm:text-lg font-bold leading-snug drop-shadow-sm">
                          {promo.title}
                        </h4>

                        <p className="text-xs text-white/90 leading-relaxed line-clamp-2">
                          {promo.description}
                        </p>

                        <div className="space-y-1.5 pt-2">
                          {promo.primaryButtonText && (
                            <button
                              type="button"
                              onClick={() => {
                                setShopMegaOpen(false);
                                router.push(promo.primaryButtonLink || "/shop");
                              }}
                              className="w-full py-2.5 rounded-xl bg-white text-primary text-xs font-bold uppercase tracking-wider hover:bg-lilac transition duration-200 shadow-md flex items-center justify-center gap-1.5"
                            >
                              <span>{promo.primaryButtonText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {promo.secondaryButtonText && (
                            <button
                              type="button"
                              onClick={() => {
                                setShopMegaOpen(false);
                                if (promo.secondaryButtonLink === "#waitlist" || promo.secondaryButtonLink === "waitlist") {
                                  onOpenWaitlist?.();
                                } else if (promo.secondaryButtonLink) {
                                  router.push(promo.secondaryButtonLink);
                                } else {
                                  onOpenWaitlist?.();
                                }
                              }}
                              className="w-full py-1.5 text-white/90 hover:text-white text-[11px] font-semibold uppercase tracking-wider underline underline-offset-4 transition text-center"
                            >
                              {promo.secondaryButtonText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. NEW ARRIVALS */}
          <button
            type="button"
            onClick={() => handleNavClick("/new-arrivals")}
            className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap py-1.5 inline-flex items-center"
          >
            <span>NEW ARRIVALS</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out group-hover:w-full" />
          </button>

          {/* 4. BEST SELLERS */}
          <button
            type="button"
            onClick={() => handleNavClick("/best-sellers")}
            className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap py-1.5 inline-flex items-center"
          >
            <span>BEST SELLERS</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out group-hover:w-full" />
          </button>

          {/* 5. OUR STORY */}
          <button
            type="button"
            onClick={() => handleNavClick("/about")}
            className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap py-1.5 inline-flex items-center"
          >
            <span>OUR STORY</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out group-hover:w-full" />
          </button>

          {/* 6. CONTACT */}
          <button
            type="button"
            onClick={() => handleNavClick("/contact")}
            className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap py-1.5 inline-flex items-center"
          >
            <span>CONTACT</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out group-hover:w-full" />
          </button>

          {/* 7. REVIEWS (Strictly clean text REVIEWS, NO star emoji, animated underline micro-interaction) */}
          <button
            type="button"
            onClick={() => handleNavClick("/#reviews", "reviews")}
            className="group relative font-sans text-sm font-semibold tracking-wide text-text-dark/85 hover:text-primary transition-colors duration-250 uppercase whitespace-nowrap py-1.5 inline-flex items-center"
          >
            <span>REVIEWS</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 ease-out group-hover:w-full" />
          </button>
        </nav>

        {/* Right: Action Icons (Search, User, Cart) & WAITLIST Button - Perfectly balanced flexbox */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 rounded-full text-text-dark hover:text-primary hover:bg-lilac transition duration-200 flex items-center justify-center focus:outline-none"
            aria-label="Search catalog"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Profile / Auth (Clean luxury user icon; clicking opens Sign In or navigates to /account) */}
          <button
            type="button"
            onClick={() => {
              if (customer) {
                router.push("/account");
              } else if (onOpenAuth) {
                onOpenAuth();
              } else {
                router.push("/?auth=login");
              }
            }}
            className="p-2.5 rounded-full text-text-dark hover:text-primary hover:bg-lilac transition duration-200 flex items-center justify-center focus:outline-none relative"
            aria-label={customer ? `Signed in as ${customer.name} · Open Account` : "Sign In or Join VIP Circle"}
            title={customer ? `Signed in as ${customer.name} · Open Account` : "Sign In / Join VIP Circle"}
          >
            <User className="w-5 h-5" />
            {customer && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          {/* Cart Icon with Dynamic Counter (Opens luxury slide-over CartDrawer) */}
          <button
            type="button"
            onClick={() => openCart()}
            className="relative p-2.5 rounded-full text-text-dark hover:text-primary hover:bg-lilac transition duration-200 flex items-center justify-center focus:outline-none"
            aria-label={`Shopping bag with ${displayCartCount} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center font-sans">
              {displayCartCount}
            </span>
          </button>

          {/* WAITLIST Button - Visible on Desktop/Tablet (>= 768px), Hidden on Mobile (< 768px) per spec */}
          <button
            type="button"
            onClick={() => onOpenWaitlist?.()}
            className="hidden md:inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-white font-sans text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-primary/25 whitespace-nowrap"
          >
            WAITLIST
          </button>
        </div>
      </div>

      {/* Quick Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-[#F8F6FA] px-5 py-3 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                  }
                }}
                placeholder="Search formulas, kumkumadi, baby care, dew serums, cushion tints..."
                className="w-full bg-transparent text-sm font-sans text-text-dark placeholder:text-text-muted focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                  }
                }}
                className="text-xs font-semibold text-primary uppercase font-sans hover:underline shrink-0"
              >
                Search
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Slide-Out Drawer Menu (< 768px Framer Motion Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Panel with cubic-bezier ease */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto z-10"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <DuckLogo className="h-10 w-auto max-w-[150px]" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full text-text-gray hover:text-text-dark hover:bg-lilac transition"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="mt-6 flex flex-col gap-1.5" aria-label="Mobile Menu Links">
                  <button
                    type="button"
                    onClick={() => handleNavClick("/")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>HOME</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick("/shop")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>SHOP ALL</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>

                  {/* Dynamic Mobile Category Sub-Items */}
                  <div className="pl-3 py-1 space-y-1">
                    {mainCategories.map((cat) => (
                      <button
                        key={cat.id || cat.slug}
                        type="button"
                        onClick={() => handleCategoryNavigate(cat.slug)}
                        className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold text-text-muted hover:text-primary hover:bg-[#F8F6FA] transition flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3 h-3 text-text-muted" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick("/new-arrivals")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>NEW ARRIVALS</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick("/best-sellers")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>BEST SELLERS</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick("/about")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>OUR STORY</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick("/contact")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>CONTACT</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>

                  {/* Account link on mobile */}
                  {customer ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/account");
                      }}
                      className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-primary bg-lilac/70 hover:bg-lilac transition uppercase flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span>MY ACCOUNT ({customer.name})</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth?.();
                      }}
                      className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-text-muted" />
                        <span>SIGN IN / JOIN VIP</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-text-muted" />
                    </button>
                  )}

                  {/* Clean REVIEWS link without emoji */}
                  <button
                    type="button"
                    onClick={() => handleNavClick("/#reviews", "reviews")}
                    className="w-full text-left py-3 px-4 rounded-xl font-sans text-sm font-semibold tracking-wide text-text-dark hover:bg-lilac hover:text-primary transition uppercase flex items-center justify-between"
                  >
                    <span>REVIEWS</span>
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </button>
                </nav>
              </div>

              {/* Bottom Drawer CTA: Waitlist Button */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenWaitlist?.();
                  }}
                  className="w-full py-3.5 rounded-full bg-primary text-white font-sans text-sm font-semibold tracking-wide uppercase transition-colors duration-300 hover:bg-primary-hover shadow-md shadow-primary/20"
                >
                  Join The Waitlist
                </button>
                <p className="text-center text-[11px] text-text-muted font-sans">
                  Pre-Launch VIP Access · Duck Cosmetics Atelier
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}