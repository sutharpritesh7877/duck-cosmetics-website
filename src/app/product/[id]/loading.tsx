import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PdpSkeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      <PdpSkeleton />
      <Footer />
    </div>
  );
}
