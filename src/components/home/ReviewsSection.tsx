"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote,
  MessageSquare,
  CheckCircle2,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  productId?: string;
  productTitle?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminReply?: string;
  verified: boolean;
  createdAt: string;
}

interface ReviewsSectionProps {
  initialReviews?: ReviewItem[];
}

export function ReviewsSection({ initialReviews = [] }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    productId: "",
  });

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchApprovedReviews = async () => {
    try {
      const res = await fetch("/api/reviews?status=APPROVED");
      const data = await res.json();
      if (data.success && data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews);
      }
    } catch {
      // fallback to initial
    }
  };

  useEffect(() => {
    if (initialReviews.length === 0) {
      fetchApprovedReviews();
    }
  }, [initialReviews]);

  const activeReviews = reviews.filter((r) => r.status === "APPROVED");
  const count = activeReviews.length;

  const handleNext = () => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  };

  const handlePrev = () => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName,
          rating: Number(formData.rating),
          comment: formData.comment,
          productId: formData.productId || undefined,
          status: "APPROVED",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit review");
      }

      toastSuccess("Thank you! Your verified testimonial has been published.");
      setWriteModalOpen(false);
      setFormData({ customerName: "", rating: 5, comment: "", productId: "" });
      fetchApprovedReviews();
    } catch (err: any) {
      toastError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (count === 0) return null;

  const currentReview = activeReviews[currentIndex] || activeReviews[0];

  return (
    <section id="reviews" className="py-24 bg-[#F8F6FA] border-b border-gray-100 font-sans relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lilac/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lilac-subtle rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 relative z-10"
      >
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-lilac-border text-[11px] font-semibold tracking-widest text-primary uppercase mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Client Praise & Testimonials</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-dark tracking-tight">
            VERIFIED EXPERIENCES
          </h2>

          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <span className="font-serif font-bold text-text-dark text-sm">
              4.9 / 5.0
            </span>
            <span className="text-text-muted text-xs">
              · From verified pre-launch VIP clientele
            </span>
          </div>
        </div>

        {/* Testimonial Carousel Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-[0_16px_40px_rgba(93,58,122,0.06)] min-h-[320px] flex flex-col justify-between">
            {/* Top Row: Stars & Quote Icon */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div className="flex items-center gap-1">
                {Array.from({ length: currentReview.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
                <span className="ml-2 text-xs font-bold text-text-dark">
                  {currentReview.rating}.0
                </span>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-lilac flex items-center justify-center text-primary">
                <Quote className="w-5 h-5 opacity-70" />
              </div>
            </div>

            {/* Testimonial Body with Animated Slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="py-6 sm:py-8 space-y-4"
              >
                <p className="font-serif text-lg sm:text-2xl text-text-dark leading-relaxed italic">
                  &ldquo;{currentReview.comment}&rdquo;
                </p>

                {currentReview.adminReply && (
                  <div className="p-4 rounded-2xl bg-lilac/70 border border-lilac-border text-xs text-text-dark space-y-1">
                    <p className="font-bold text-primary text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Atelier Concierge Response:</span>
                    </p>
                    <p className="text-text-gray italic leading-relaxed">
                      {currentReview.adminReply}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Row: Customer & Product Details */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lilac border border-lilac-border flex items-center justify-center text-primary font-bold text-sm">
                  {currentReview.customerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-serif font-bold text-sm text-text-dark">
                      {currentReview.customerName}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified VIP</span>
                    </span>
                  </div>
                  {currentReview.productTitle && (
                    <p className="text-[11px] text-primary font-medium mt-0.5">
                      Formula: {currentReview.productTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs text-text-muted font-sans mr-1">
                  {currentIndex + 1} of {count}
                </span>

                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-lilac hover:bg-lilac-subtle text-text-dark hover:text-primary transition duration-200"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-lilac hover:bg-lilac-subtle text-text-dark hover:text-primary transition duration-200"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Write a Review Button */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setWriteModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-lilac border border-lilac-border text-primary text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share Your Atelier Experience</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Write a Review Modal */}
      {writeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setWriteModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10 font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-text-dark">
                  Submit Client Testimonial
                </h3>
                <p className="text-xs text-text-gray mt-0.5">
                  Share your skin transformation with our global clientele.
                </p>
              </div>
              <button
                onClick={() => setWriteModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="e.g. Dr. Radhika Sharma"
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Luminescence Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 text-amber-500 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formData.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-text-dark ml-2">
                    {formData.rating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1.5">
                  Your Testimonial & Results *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Describe the texture, radiance, hydration, or sensory finish..."
                  className="w-full px-4 py-3 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWriteModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] hover:scale-[1.02] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-60"
                >
                  {submitting ? "Publishing..." : "Publish Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
