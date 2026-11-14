import React from "react";
import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "My Account · VIP Atelier Dashboard | Duck Cosmetics",
  description: "Manage your Duck Cosmetics VIP waitlist status, orders, addresses, private wishlist, and atelier concierge inquiries.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}
