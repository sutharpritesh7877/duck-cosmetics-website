"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  X,
  Check,
  Tag,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ImageUploadDropzone } from "@/components/admin/ImageUploadDropzone";

interface Category {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  bannerImageUrl?: string | null;
  subCategoriesList?: string[];
  subCategories?: any[];
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // Form state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formShortDescription, setFormShortDescription] = useState("");
  const [formBannerImageUrl, setFormBannerImageUrl] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoriesList, setSubCategoriesList] = useState<string[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data.categories) ? data.categories : []);
      setCategories(list);
    } catch {
      toastError("Could not load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormShortDescription("");
    setFormBannerImageUrl("");
    setFormDisplayOrder(categories.length);
    setSubCategoryInput("");
    setSubCategoriesList([]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name || "");
    setFormSlug(cat.slug || "");
    setFormShortDescription(cat.shortDescription || "");
    setFormBannerImageUrl(cat.bannerImageUrl || "");
    setFormDisplayOrder(cat.displayOrder ?? 0);
    setSubCategoryInput("");

    // extract subcategories
    const subs = Array.isArray(cat.subCategoriesList) && cat.subCategoriesList.length > 0
      ? cat.subCategoriesList
      : Array.isArray(cat.subCategories)
      ? cat.subCategories.map((s: any) => (typeof s === "string" ? s : s.name))
      : [];
    setSubCategoriesList(subs);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      // Auto slug
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(generatedSlug);
    }
  };

  const handleAddSubCategory = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter" && e.key !== ",") return;
    if (e) e.preventDefault();

    const trimmed = subCategoryInput.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;

    // split if comma entered
    const splitItems = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !subCategoriesList.includes(s));

    if (splitItems.length > 0) {
      setSubCategoriesList([...subCategoriesList, ...splitItems]);
      setSubCategoryInput("");
    }
  };

  const handleRemoveSubCategory = (index: number) => {
    setSubCategoriesList(subCategoriesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      toastError("Category Name and Slug are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase(),
        shortDescription: formShortDescription.trim(),
        bannerImageUrl: formBannerImageUrl.trim(),
        displayOrder: Number(formDisplayOrder) || 0,
        subCategoriesList: subCategoriesList,
      };

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update category");
        toastSuccess(`Updated "${payload.name}" successfully!`);
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create category");
        toastSuccess(`Created "${payload.name}" successfully!`);
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch {
      toastError("Error saving category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      toastSuccess(`Deleted "${cat.name}".`);
      await fetchCategories();
    } catch {
      toastError("Could not delete category.");
    }
  };

  const handleMoveOrder = async (cat: Category, direction: "up" | "down") => {
    const sorted = [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const currentIndex = sorted.findIndex((c) => c.id === cat.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetCat = sorted[targetIndex];

    try {
      // Swap displayOrder
      const tempOrder = cat.displayOrder ?? 0;
      const targetOrder = targetCat.displayOrder ?? 0;

      await Promise.all([
        fetch(`/api/categories/${cat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: targetOrder === tempOrder ? (direction === "up" ? tempOrder - 1 : tempOrder + 1) : targetOrder }),
        }),
        fetch(`/api/categories/${targetCat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: tempOrder }),
        }),
      ]);

      await fetchCategories();
      toastSuccess("Category order updated.");
    } catch {
      toastError("Could not reorder category.");
    }
  };

  const filteredCategories = categories
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.shortDescription && c.shortDescription.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Store Taxonomy & Navigation</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Category Manager
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Configure shopping categories, tags, sub-category chips, and direct banner assets for the Mega-Menu & Collection pages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload categories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug or description..."
            className="w-full pl-10 pr-4 py-2 bg-lilac/50 border border-gray-200 rounded-xl text-xs text-text-dark placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-text-gray">
          <span className="font-semibold text-text-dark">{filteredCategories.length}</span> categories configured
          <span className="text-text-muted">|</span>
          <span className="text-primary font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Live in Mega-Menu
          </span>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-text-gray">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center text-text-gray">
            <Layers className="w-10 h-10 mx-auto mb-3 text-text-muted opacity-40" />
            <p className="text-sm font-medium text-text-dark">No categories found</p>
            <p className="text-xs text-text-gray mt-1">
              {search ? "No categories matched your search term." : "Start by adding your first product category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-lilac/60 border-b border-gray-200 uppercase text-[10px] tracking-wider text-text-gray font-semibold">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Order</th>
                  <th className="py-3.5 px-4 w-24">Banner</th>
                  <th className="py-3.5 px-4">Name & Slug</th>
                  <th className="py-3.5 px-4">Short Description</th>
                  <th className="py-3.5 px-4">Sub-Categories / Tags</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat, idx) => {
                  const subs = Array.isArray(cat.subCategoriesList) && cat.subCategoriesList.length > 0
                    ? cat.subCategoriesList
                    : Array.isArray(cat.subCategories)
                    ? cat.subCategories.map((s: any) => (typeof s === "string" ? s : s.name))
                    : [];

                  return (
                    <tr key={cat.id} className="hover:bg-lilac/30 transition group">
                      {/* Order column with Up/Down buttons */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono font-bold text-xs bg-lilac px-2 py-0.5 rounded text-primary">
                            #{cat.displayOrder ?? idx}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveOrder(cat, "up")}
                              disabled={idx === 0}
                              className="text-text-muted hover:text-primary disabled:opacity-20 p-0.5"
                              title="Move up in Mega-Menu"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(cat, "down")}
                              disabled={idx === filteredCategories.length - 1}
                              className="text-text-muted hover:text-primary disabled:opacity-20 p-0.5"
                              title="Move down in Mega-Menu"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Banner column */}
                      <td className="py-4 px-4">
                        {cat.bannerImageUrl ? (
                          <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-200 relative bg-lilac">
                            <Image
                              src={cat.bannerImageUrl}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-10 rounded-lg border border-dashed border-gray-300 bg-lilac/40 flex items-center justify-center text-text-muted">
                            <ImageIcon className="w-4 h-4 opacity-40" />
                          </div>
                        )}
                      </td>

                      {/* Name & Slug */}
                      <td className="py-4 px-4">
                        <div className="font-serif font-bold text-sm text-text-dark">
                          {cat.name}
                        </div>
                        <code className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          /shop/{cat.slug}
                        </code>
                      </td>

                      {/* Short Description */}
                      <td className="py-4 px-4 text-text-gray max-w-xs">
                        <p className="line-clamp-2 text-xs">
                          {cat.shortDescription || (
                            <span className="italic text-text-muted">No description provided</span>
                          )}
                        </p>
                      </td>

                      {/* Sub-categories */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {subs.length > 0 ? (
                            subs.map((s, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-white border border-gray-200 text-[10px] font-medium text-text-dark px-2 py-0.5 rounded-full"
                              >
                                <Tag className="w-2.5 h-2.5 text-primary" />
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-text-muted italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 rounded-lg border border-gray-200 text-text-gray hover:text-primary hover:bg-lilac transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 rounded-lg border border-gray-200 text-text-gray hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-gray-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-lilac/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-text-dark">
                    {editingCategory ? "Edit Category" : "New Category"}
                  </h3>
                  <p className="text-[11px] text-text-gray">
                    Define name, slug, subcategory tags, order, and direct banner asset.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-text-gray hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Lip Care"
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-lilac/70 border border-r-0 border-gray-200 rounded-l-xl text-xs text-text-muted">
                      /shop/
                    </span>
                    <input
                      type="text"
                      required
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="lips"
                      className="w-full px-4 py-2.5 rounded-r-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Display Order in Mega-Menu (Lower numbers appear first)
                </label>
                <input
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  min={0}
                  className="w-full sm:w-36 px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                  placeholder="e.g. Nourishing, high-shine lip oils and peptide glosses."
                  className="w-full px-4 py-2.5 rounded-xl bg-lilac/40 border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Shown in the Mega-Menu preview and on the collection header.
                </p>
              </div>

              {/* Sub-Categories Tag Manager */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                  Sub-Categories / Tags (Chips)
                </label>
                <div className="p-3 bg-lilac/30 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={subCategoryInput}
                      onChange={(e) => setSubCategoryInput(e.target.value)}
                      onKeyDown={handleAddSubCategory}
                      placeholder="Type a sub-category (e.g. Lip Oils) and press Enter or comma..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubCategory}
                      className="px-3.5 py-2 bg-text-dark hover:bg-primary text-white rounded-xl text-xs font-semibold transition"
                    >
                      Add Tag
                    </button>
                  </div>

                  {subCategoriesList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {subCategoriesList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-white border border-primary/20 text-text-dark text-xs font-medium px-3 py-1 rounded-full shadow-2xs"
                        >
                          <Tag className="w-3 h-3 text-primary" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubCategory(idx)}
                            className="text-text-muted hover:text-red-500 transition ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-1">
                  These appear as clickable quick-filters in the Mega-Menu under this category.
                </p>
              </div>

              {/* Direct Banner Image Upload */}
              <div>
                <ImageUploadDropzone
                  value={formBannerImageUrl}
                  onChange={(url) => setFormBannerImageUrl(url)}
                  label="Category Banner Image (Direct Upload)"
                  description="Upload a high-res banner asset from your computer (JPG, PNG, WebP). Used in category page hero."
                  aspectRatio="banner"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingCategory ? "Update Category" : "Create Category"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
