"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  MessageSquare,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  tags?: string[];
  createdAt: string;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formOrder, setFormOrder] = useState(1);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      if (data.success && Array.isArray(data.faqs)) {
        setFaqs(data.faqs);
      } else {
        toastError("Failed to load Concierge Q&As.");
      }
    } catch {
      toastError("Network error while loading Q&As.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormIsActive(true);
    setFormOrder(faqs.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormIsActive(faq.isActive);
    setFormOrder(faq.order);
    setModalOpen(true);
  };

  const handleToggleActive = async (faq: FaqItem) => {
    try {
      const updatedStatus = !faq.isActive;
      const res = await fetch(`/api/faqs/${faq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === faq.id ? { ...f, isActive: updatedStatus } : f))
        );
        toastSuccess(
          `Question ${updatedStatus ? "activated" : "hidden"} in Smart Concierge.`
        );
      }
    } catch {
      toastError("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Concierge Q&A?")) return;
    try {
      const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        toastSuccess("Concierge Q&A removed.");
      }
    } catch {
      toastError("Failed to delete Q&A.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) {
      toastError("Question and Answer are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingFaq) {
        // Update
        const res = await fetch(`/api/faqs/${editingFaq.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formQuestion,
            answer: formAnswer,
            isActive: formIsActive,
            order: Number(formOrder),
          }),
        });
        const data = await res.json();
        if (data.success) {
          toastSuccess("Concierge Q&A updated successfully.");
          setModalOpen(false);
          fetchFaqs();
        } else {
          toastError(data.error || "Failed to update Q&A.");
        }
      } else {
        // Create
        const res = await fetch("/api/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: formQuestion,
            answer: formAnswer,
            isActive: formIsActive,
            order: Number(formOrder),
          }),
        });
        const data = await res.json();
        if (data.success) {
          toastSuccess("New Concierge Q&A published.");
          setModalOpen(false);
          fetchFaqs();
        } else {
          toastError(data.error || "Failed to create Q&A.");
        }
      }
    } catch {
      toastError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Pre-Loaded Smart Concierge Engine
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-dark">
            Concierge Q&A Knowledge Base
          </h1>
          <p className="text-sm text-text-gray mt-1">
            Zero hallucinations, zero API fees. Manage the pre-loaded knowledge base powering the floating storefront concierge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchFaqs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold uppercase tracking-wider text-text-dark hover:bg-lilac transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Q&A</span>
          </button>
        </div>
      </div>

      {/* Search and Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-sans text-text-gray">
          <span>
            Total Entries: <strong className="text-text-dark">{faqs.length}</strong>
          </span>
          <span>·</span>
          <span>
            Active in Widget:{" "}
            <strong className="text-emerald-600">
              {faqs.filter((f) => f.isActive).length}
            </strong>
          </span>
        </div>
      </div>

      {/* FAQ Cards Table */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
            <span className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin inline-block" />
            <p className="text-xs text-text-muted mt-3">Loading Knowledge Base...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
            <HelpCircle className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-serif font-bold text-text-dark">No Q&As found</p>
            <p className="text-xs text-text-muted mt-1">Try a different search term or add a new question.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => (
            <div
              key={faq.id}
              className={`p-6 rounded-2xl bg-white border transition shadow-2xs ${
                faq.isActive
                  ? "border-gray-200 hover:border-primary/40"
                  : "border-gray-200/60 bg-gray-50/60 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-lilac text-primary font-mono text-xs font-bold flex items-center justify-center">
                      #{faq.order || idx + 1}
                    </span>
                    <h3 className="font-serif text-base font-bold text-text-dark">
                      {faq.question}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        faq.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {faq.isActive ? "Active in Chat" : "Hidden"}
                    </span>
                  </div>

                  <p className="text-xs text-text-gray leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 sm:pt-0 pt-2">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(faq)}
                    className="p-2 rounded-lg text-text-gray hover:bg-lilac transition"
                    title={faq.isActive ? "Hide from Concierge" : "Show in Concierge"}
                  >
                    {faq.isActive ? (
                      <ToggleRight className="w-6 h-6 text-primary" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-text-muted" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg text-text-gray hover:text-text-dark hover:bg-lilac transition"
                    title="Edit Q&A"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 rounded-lg text-text-gray hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Q&A"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create or Edit Q&A */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-gray-200 font-sans space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-serif text-xl font-bold text-text-dark">
                {editingFaq ? "Edit Concierge Q&A" : "Add New Concierge Q&A"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-text-gray hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  User Question *
                </label>
                <input
                  type="text"
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. When will the Baby Care line be released?"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Maison Answer (Exact Pre-Loaded Response) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Formulated with precision and clarity..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-lilac/30 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-dark">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span>Active in Concierge Chat</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase tracking-wider text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm disabled:opacity-60"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Q&A</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
