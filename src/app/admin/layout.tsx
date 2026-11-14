import React from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Duck Executive Portal | Admin & CMS",
  description: "Duck Cosmetics Administration, Product Management, Waitlist, and CMS",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
