"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Reply,
  ShieldCheck,
  X,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Review {
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

interface Product {
  id: string;
  title: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyReview, setReplyReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  // Create Review Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    productId: "",
    status: "APPROVED" as "APPROVED" | "PENDING",
  });

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.success && data.reviews) {
        setReviews(data.reviews);
      } else {
        toastError(data.error || "Failed to load reviews");
      }
    } catch {
      toastError("Network error while loading reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update review status");
      }

      toastSuccess(`Review status marked as ${newStatus}`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
      );
    } catch (err: any) {
      toastError(err.message || "Failed to update status");
    }
  };

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReview) return;

    try {
      const res = await fetch(`/api/reviews/${replyReview.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save reply");
      }

      toastSuccess("Atelier concierge response published.");
      setReviews((prev) =>
        prev.map((r) =>
          r.id === replyReview.id ? { ...r, adminReply: replyText } : r
        )
      );
      setReplyModalOpen(false);
      setReplyText("");
      setReplyReview(null);
    } catch (err: any) {
      toastError(err.message || "Failed to reply to review");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this testimonial?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete review");
      }

      toastSuccess("Review deleted successfully.");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toastError(err.message || "Failed to delete review");
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create review");
      }

      toastSuccess("Testimonial added to catalog!");
      setCreateModalOpen(false);
      setCreateForm({
        customerName: "",
        rating: 5,
        comment: "",
        productId: "",
        status: "APPROVED",
      });
      fetchReviews();
    } catch (err: any) {
      toastError(err.message || "Failed to add review");
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      (r.productTitle && r.productTitle.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <Star className="w-3.5 h-3.5" />
            <span>Reputation & Testimonials Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Client Reviews & Praise
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Moderate verified customer experiences, publish concierge replies, and curate 5-star testimonials shown on the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReviews}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload reviews"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Curated Review</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Total Reviews
          </p>
          <p className="font-serif text-3xl font-bold text-text-dark mt-1">
            {reviews.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Published (Approved)
          </p>
          <p className="font-serif text-3xl font-bold text-emerald-600 mt-1">
            {reviews.filter((r) => r.status === "APPROVED").length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Pending Moderation
          </p>
          <p className="font-serif text-3xl font-bold text-amber-600 mt-1">
            {reviews.filter((r) => r.status === "PENDING").length}
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            {["ALL", "APPROVED", "PENDING", "REJECTED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  statusFilter === st
                    ? "bg-primary text-white"
                    : "bg-lilac text-text-gray hover:text-text-dark hover:bg-lilac-subtle"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, comment, product..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-lilac/40 text-[11px] font-semibold text-text-gray uppercase tracking-wider">
                <th className="py-3.5 px-5">Client</th>
                <th className="py-3.5 px-5">Rating</th>
                <th className="py-3.5 px-5">Comment & Response</th>
                <th className="py-3.5 px-5">Associated Formula</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No testimonials match your filter.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-lilac/30 transition">
                    {/* Client */}
                    <td className="py-4 px-5">
                      <p className="font-semibold text-text-dark">{rev.customerName}</p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Stars */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </td>

                    {/* Comment & Admin Reply */}
                    <td className="py-4 px-5 max-w-sm">
                      <p className="text-text-dark italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                      {rev.adminReply && (
                        <div className="mt-1.5 p-2 rounded-lg bg-lilac/70 border border-lilac-border text-[11px] text-primary">
                          <span className="font-bold">Concierge Reply: </span>
                          <span className="text-text-gray">{rev.adminReply}</span>
                        </div>
                      )}
                    </td>

                    {/* Formula */}
                    <td className="py-4 px-5 text-text-dark font-medium">
                      {rev.productTitle || "Global Storefront"}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-5">
                      <select
                        value={rev.status}
                        onChange={(e) => handleUpdateStatus(rev.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold focus:outline-none ${
                          rev.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : rev.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <option value="APPROVED">APPROVED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyReview(rev);
                            setReplyText(rev.adminReply || "");
                            setReplyModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-text-gray hover:text-primary hover:bg-lilac transition"
                          title="Reply to review"
                        >
                          <Reply className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg text-text-gray hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModalOpen && replyReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setReplyModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-text-dark">
                Reply to {replyReview.customerName}&apos;s Testimonial
              </h3>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 rounded-xl bg-lilac/50 border border-lilac-border text-xs text-text-gray italic">
              &ldquo;{replyReview.comment}&rdquo;
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Atelier Concierge Reply *
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for your patronage..."
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
                >
                  Publish Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Curated Review Modal */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-text-dark">
                Add Curated Client Testimonial
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.customerName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, customerName: e.target.value })
                  }
                  placeholder="e.g. Mira Kapoor"
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Rating (1–5 Stars)
                  </label>
                  <select
                    value={createForm.rating}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, rating: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Target Formula
                  </label>
                  <select
                    value={createForm.productId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, productId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                  >
                    <option value="">Storefront Overall</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Review Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={createForm.comment}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, comment: e.target.value })
                  }
                  placeholder="Enter the client testimonial text..."
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm"
                >
                  Publish Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
