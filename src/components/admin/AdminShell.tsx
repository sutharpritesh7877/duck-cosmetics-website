"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Sliders,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  Mail,
  UserCheck,
  PackageCheck,
  Star,
  Tag,
  CreditCard,
  HelpCircle,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { DuckLogo } from "@/components/ui/DuckLogo";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // If this is the login page, render children directly without admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", { method: "POST" });
      toastSuccess("Logged out of Executive Portal.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toastError("Error during logout.");
    }
  };

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Order Management (OMS)",
      href: "/admin/orders",
      icon: PackageCheck,
      active: pathname.startsWith("/admin/orders"),
    },
    {
      label: "Product Management",
      href: "/admin/products",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin/products"),
    },
    {
      label: "Category Manager",
      href: "/admin/categories",
      icon: Layers,
      active: pathname.startsWith("/admin/categories"),
    },
    {
      label: "Mega Menu Editor",
      href: "/admin/mega-menu",
      icon: LayoutGrid,
      active: pathname.startsWith("/admin/mega-menu"),
    },
    {
      label: "Review Management",
      href: "/admin/reviews",
      icon: Star,
      active: pathname.startsWith("/admin/reviews"),
    },
    {
      label: "Coupons & Promotions",
      href: "/admin/coupons",
      icon: Tag,
      active: pathname.startsWith("/admin/coupons"),
    },
    {
      label: "Site Atmosphere CMS",
      href: "/admin/cms",
      icon: Sliders,
      active: pathname === "/admin/cms",
    },
    {
      label: "CMS Pages Editor",
      href: "/admin/pages",
      icon: FileText,
      active: pathname.startsWith("/admin/pages"),
    },
    {
      label: "Contact & Concierge",
      href: "/admin/contact",
      icon: Mail,
      active: pathname.startsWith("/admin/contact"),
    },
    {
      label: "Concierge Q&A",
      href: "/admin/faq",
      icon: HelpCircle,
      active: pathname.startsWith("/admin/faq") || pathname.startsWith("/admin/concierge"),
    },
    {
      label: "Staff Management",
      href: "/admin/staff",
      icon: UserCheck,
      active: pathname.startsWith("/admin/staff"),
    },
    {
      label: "Waitlist Manager",
      href: "/admin/waitlist",
      icon: Users,
      active: pathname.startsWith("/admin/waitlist"),
    },
    {
      label: "Payments & Shipping",
      href: "/admin/settings",
      icon: CreditCard,
      active: pathname.startsWith("/admin/settings"),
    },
  ];

  return (
    <div className="min-h-screen bg-lilac/50 flex flex-col lg:flex-row text-text-dark font-sans selection:bg-primary selection:text-white">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <Link href="/admin" className="flex items-center gap-2">
          <DuckLogo variant="purple" className="h-8 w-24" />
          <span className="text-[9px] font-semibold text-primary uppercase tracking-widest bg-lilac px-2 py-0.5 rounded">
            ADMIN
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-text-gray hover:bg-lilac"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-40 flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand & Executive Badge */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/admin" className="group flex items-center">
              <DuckLogo variant="purple" className="h-10 w-32" />
            </Link>
            <span className="p-1 rounded-full bg-lilac text-primary" title="Authenticated Executive">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Admin Navigation">
            <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-widest text-text-muted">
              Main Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                    item.active
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-gray hover:text-text-dark hover:bg-lilac"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? "text-white" : "text-text-muted"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Storefront Link & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* Quick link to live store */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium text-text-gray hover:text-primary hover:bg-lilac transition duration-200"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-text-muted" />
              <span>View Live Store</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider bg-lilac px-1.5 py-0.5 rounded text-primary">
              Pre-Launch
            </span>
          </Link>

          {/* Admin User Info & Logout Button */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary font-bold text-xs shrink-0">
                A
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-text-dark truncate">Admin Executive</p>
                <p className="text-[10px] text-text-muted truncate">admin@duckcosmetics.com</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-text-gray hover:text-rose-600 hover:bg-rose-50 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
