import React from "react";
import type { Metadata } from "next";
import { dbService } from "@/lib/db";
import { ContactClient } from "@/components/contact/ContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contact Client Concierge | Duck Cosmetics",
  description:
    "Connect with the Duck Cosmetics Haute Atelier. 3 Direct Phone Lines, Concierge Email, and Ahmedabad Maison Address.",
};

export default async function ContactPage() {
  const [contact, settings] = await Promise.all([
    dbService.getContactSettings(),
    dbService.getSiteSettings(),
  ]);

  return <ContactClient contact={contact} settings={settings} />;
}
