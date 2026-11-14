"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PackageCheck,
  User,
  MapPin,
  Heart,
  HelpCircle,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { CustomerAuthModal } from "@/components/ui/CustomerAuthModal";
import { useToast } from "@/components/ui/Toast";

interface AccountShellProps {
  children: React.ReactNode;
}

export function AccountShell({ children }: AccountShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [customer, setCustomer] = useState<{ id?: string; name: string; email: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync customer session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("duck_customer");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.isGuest || parsed?.name === "VIP Guest") {
          localStorage.removeItem("duck_customer");
          setCustomer(null);
          setAuthModalOpen(true);
        } else {
          setCustomer(parsed);
        }
      } else {
        // Fallback: check profile endpoint
        fetch("/api/account/profile")
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.profile) {
              setCustomer(data.profile);
              localStorage.setItem("duck_customer", JSON.stringify(data.profile));
            } else {
              setAuthModalOpen(true);
            }
          })
          .catch(() => {
            setAuthModalOpen(true);
          });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("duck_customer");
      document.cookie = "duck_customer_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      setCustomer(null);
      toastSuccess("You have been signed out of your atelier account.");
      router.push("/");
      router.refresh();
    } catch {
      toastError("Failed to sign out.");
    }
  };

  const navItems = [
    {
      label: "Overview",
      href: "/account",
      icon: LayoutDashboard,
      active: pathname === "/account",
    },
    {
      label: "My Orders",
      href: "/account/orders",
      icon: PackageCheck,
      active: pathname.startsWith("/account/orders"),
    },
    {
      label: "My Profile",
      href: "/account/profile",
      icon: User,
      active: pathname.startsWith("/account/profile"),
    },
    {
      label: "Address Book",
      href: "/account/addresses",
      icon: MapPin,
      active: pathname.startsWith("/account/addresses"),
    },
    {
      label: "My Wishlist",
      href: "/account/wishlist",
      icon: Heart,
      active: pathname.startsWith("/account/wishlist"),
    },
    {
      label: "Concierge & Support",
      href: "/account/support",
      icon: HelpCircle,
      active: pathname.startsWith("/account/support"),
    },
  ];

  const currentTab = navItems.find((item) => item.active) || navItems[0];
  const userInitials = customer?.name
    ? customer.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DC";

  return (
    <div className="min-h-screen flex flex-col bg-white text-text-dark selection:bg-primary selection:text-white font-sans">
      {/* Announcement Bar */}
      <AnnouncementBar text="VIP Atelier Dashboard · 100% Cruelty-Free & Complimentary Express Shipping" />

      {/* Main Header */}
      <Header customer={customer} onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-[#FAF7FC] via-white to-white border-b border-lilac-border/60 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted mb-3 font-sans">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted/60" />
            <Link href="/account" className="hover:text-primary transition">Account</Link>
            {pathname !== "/account" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-text-muted/60" />
                <span className="text-text-dark font-medium">{currentTab.label}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-text-dark font-normal tracking-tight">
                My Atelier Dashboard
              </h1>
              <p className="font-sans text-xs sm:text-sm text-text-gray mt-1">
                Manage your bespoke beauty allocations, order tracking, and private VIP waitlist privileges.
              </p>
            </div>

            {customer && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lilac border border-lilac-border self-start sm:self-auto shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Pre-Launch VIP Connoisseur
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Top-Scrollable Navigation Tab Bar */}
      <div className="lg:hidden bg-white border-b border-lilac-border sticky top-20 z-30 overflow-x-auto no-scrollbar py-2.5 px-4 shadow-2xs">
        <div className="flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  item.active
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : "bg-[#F8F6FA] text-text-gray hover:text-text-dark hover:bg-lilac"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.active ? "text-white" : "text-text-muted"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dashboard Body with Sidebar (Desktop) and Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Luxury Sidebar (4 Columns) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28">
            <div className="bg-[#F8F6FA] rounded-3xl p-6 border border-lilac-border shadow-xs">
              {/* Customer Profile Monogram Card */}
              <div className="flex items-center gap-4 pb-6 border-b border-lilac-border/80">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-serif text-xl font-bold shadow-md shadow-primary/25 shrink-0">
                  {userInitials}
                </div>
                <div className="truncate">
                  <h3 className="font-serif text-lg font-bold text-text-dark truncate">
                    {customer?.name || "VIP Connoisseur"}
                  </h3>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {customer?.email || "customer@duckcosmetics.com"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-primary uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Atelier Member</span>
                  </div>
                </div>
              </div>

              {/* Navigation Items List */}
              <nav className="mt-4 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                        item.active
                          ? "bg-primary text-white shadow-sm shadow-primary/25 translate-x-1"
                          : "text-text-dark/80 hover:bg-white hover:text-primary hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${item.active ? "text-white" : "text-text-muted group-hover:text-primary"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${item.active ? "text-white" : "text-text-muted"}`} />
                    </Link>
                  );
                })}

                {/* Sign Out Action */}
                <div className="pt-3 mt-3 border-t border-lilac-border/80">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Tab Content Panel (8 Columns) */}
          <div className="lg:col-span-8 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Customer Auth Modal for unauthorized visits */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          if (!customer) {
            router.push("/");
          }
          setAuthModalOpen(false);
        }}
        onSuccess={(logged) => {
          setCustomer(logged);
          setAuthModalOpen(false);
        }}
        promptAction="To access your private VIP Atelier Dashboard"
      />
    </div>
  );
}
