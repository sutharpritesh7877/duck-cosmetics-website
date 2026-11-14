"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Check,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  Layers,
  IndianRupee,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  mrp?: number;
  sellingPrice?: number;
  costPrice?: number;
  stock?: number;
  gst?: number;
  hsn?: string;
  imageUrl: string;
  backImageUrl?: string;
  textureImageUrl?: string;
  lifestyleImageUrl?: string;
  galleryImages?: string[];
  categoryId: string;
  categoryName?: string;
  category?: Category;
  status: "DRAFT" | "COMING_SOON" | "LIVE";
  isFeatured: boolean;
  isBestSeller?: boolean;
  ingredients?: string;
  directions?: string;
  warnings?: string;
  manufacturer?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mrp: "1499",
    sellingPrice: "1199",
    costPrice: "380",
    stock: "85",
    gst: "18",
    hsn: "330499",
    imageUrl: "",
    backImageUrl: "",
    textureImageUrl: "",
    lifestyleImageUrl: "",
    categoryId: "",
    status: "COMING_SOON" as "DRAFT" | "COMING_SOON" | "LIVE",
    isFeatured: true,
    isBestSeller: false,
    ingredients: "",
    directions: "",
    warnings: "",
    manufacturer: "",
    rating: "4.9",
    reviewCount: "120",
  });
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const { success: toastSuccess, error: toastError } = useToast();

  const syncPhotosToForm = (list: string[]) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: list[0] || "",
      backImageUrl: list[1] || "",
      textureImageUrl: list[2] || "",
      lifestyleImageUrl: list[3] || "",
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.urls)) {
        const updated = [...photos, ...result.urls];
        setPhotos(updated);
        syncPhotosToForm(updated);
        toastSuccess(`Successfully uploaded ${result.urls.length} product photo(s)!`);
      } else {
        toastError(result.error || "Failed to upload photo.");
      }
    } catch {
      toastError("Network error while uploading photo.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const updated = [...photos, newPhotoUrl.trim()];
    setPhotos(updated);
    syncPhotosToForm(updated);
    setNewPhotoUrl("");
    toastSuccess("Image URL added to gallery!");
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = photos[index];
    const filtered = photos.filter((_, i) => i !== index);
    const updated = [selected, ...filtered];
    setPhotos(updated);
    syncPhotosToForm(updated);
    toastSuccess("Set as Primary Product Photo!");
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    syncPhotosToForm(updated);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch {
      console.error("Categories fetch error");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        toastError(data.error || "Failed to load products");
      }
    } catch {
      toastError("Network error while loading catalog products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setPhotos([]);
    setNewPhotoUrl("");
    setFormData({
      title: "",
      description: "",
      mrp: "1499",
      sellingPrice: "1199",
      costPrice: "380",
      stock: "75",
      gst: "18",
      hsn: "330499",
      imageUrl: "",
      backImageUrl: "",
      textureImageUrl: "",
      lifestyleImageUrl: "",
      categoryId: categories[0]?.id || "",
      status: "COMING_SOON",
      isFeatured: true,
      isBestSeller: false,
      ingredients: "",
      directions: "",
      warnings: "",
      manufacturer: "",
      rating: "4.9",
      reviewCount: "120",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const existingPhotos = [
      product.imageUrl,
      product.backImageUrl,
      product.textureImageUrl,
      product.lifestyleImageUrl,
      ...(product.galleryImages || []),
    ].filter(Boolean) as string[];
    setPhotos(existingPhotos);
    setNewPhotoUrl("");
    setFormData({
      title: product.title,
      description: product.description,
      mrp: String(product.mrp ?? product.price ?? 1499),
      sellingPrice: String(product.sellingPrice ?? product.price ?? 1199),
      costPrice: String(product.costPrice ?? Math.round(product.price * 0.35)),
      stock: String(product.stock ?? 50),
      gst: String(product.gst ?? 18),
      hsn: product.hsn || "330499",
      imageUrl: product.imageUrl,
      backImageUrl: product.backImageUrl || "",
      textureImageUrl: product.textureImageUrl || "",
      lifestyleImageUrl: product.lifestyleImageUrl || "",
      categoryId: product.categoryId,
      status: product.status,
      isFeatured: product.isFeatured,
      isBestSeller: Boolean(product.isBestSeller),
      ingredients: product.ingredients || "",
      directions: product.directions || "",
      warnings: product.warnings || "",
      manufacturer: product.manufacturer || "",
      rating: String(product.rating ?? 4.9),
      reviewCount: String(product.reviewCount ?? 120),
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.sellingPrice) || 0,
        mrp: parseFloat(formData.mrp) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        costPrice: parseFloat(formData.costPrice) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        gst: parseFloat(formData.gst) || 18,
        hsn: formData.hsn || "330499",
        imageUrl: photos[0] || formData.imageUrl,
        backImageUrl: photos[1] || formData.backImageUrl || undefined,
        textureImageUrl: photos[2] || formData.textureImageUrl || undefined,
        lifestyleImageUrl: photos[3] || formData.lifestyleImageUrl || undefined,
        galleryImages: photos.slice(4),
        categoryId: formData.categoryId,
        status: formData.status,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        ingredients: formData.ingredients || undefined,
        directions: formData.directions || undefined,
        warnings: formData.warnings || undefined,
        manufacturer: formData.manufacturer || undefined,
        rating: parseFloat(formData.rating) || 4.9,
        reviewCount: parseInt(formData.reviewCount, 10) || 120,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      toastSuccess(
        editingProduct
          ? `Product "${formData.title}" updated successfully.`
          : `Product "${formData.title}" added to catalog.`
      );
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toastError(err.message || "An error occurred while saving the product.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === "COMING_SOON"
        ? "LIVE"
        : currentStatus === "LIVE"
        ? "DRAFT"
        : "COMING_SOON";

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(`Status changed to ${nextStatus}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, status: nextStatus as any } : p))
        );
      }
    } catch {
      toastError("Failed to update status");
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(`Featured status toggled to ${!currentFeatured ? "ON" : "OFF"}`);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isFeatured: !currentFeatured } : p
          )
        );
      }
    } catch {
      toastError("Failed to toggle featured status");
    }
  };

  const handleToggleBestSeller = async (productId: string, currentBestSeller: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBestSeller: !currentBestSeller }),
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(`Best Seller status toggled to ${!currentBestSeller ? "ON" : "OFF"}`);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isBestSeller: !currentBestSeller } : p
          )
        );
      }
    } catch {
      toastError("Failed to toggle best seller status");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toastSuccess(`Deleted "${product.title}".`);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        toastError(data.error || "Failed to delete product");
      }
    } catch {
      toastError("Error deleting product.");
    }
  };

  const filtered = products.filter((p) => {
    const matchesStatus =
      statusFilter === "ALL" ? true : p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Catalog Governance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Product Management & Stock
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Manage your formulas, MRP/Selling/Cost pricing, multi-image assets, stock alerts, and toggle between DRAFT, COMING SOON, and LIVE.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Formula</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, formulation notes..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">
            Status:
          </span>
          {["ALL", "COMING_SOON", "LIVE", "DRAFT"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                statusFilter === st
                  ? "bg-primary text-white"
                  : "bg-lilac text-text-gray hover:text-text-dark hover:bg-lilac-subtle"
              }`}
            >
              {st === "COMING_SOON" ? "Coming Soon" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-lilac/40 text-[11px] font-semibold text-text-gray uppercase tracking-wider">
                <th className="py-3.5 px-5">Formula</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Status (Click to Toggle)</th>
                <th className="py-3.5 px-5">Stock</th>
                <th className="py-3.5 px-5">Selling Price / MRP</th>
                <th className="py-3.5 px-5">GST / HSN</th>
                <th className="py-3.5 px-5 text-center">Featured</th>
                <th className="py-3.5 px-5 text-center">Best Seller</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted">
                    Loading catalog formulas...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-muted">
                    No products found matching your filter.
                  </td>
                </tr>
              ) : (
                paginated.map((product) => {
                  const stock = product.stock ?? 50;
                  const isLowStock = stock < 10;
                  const sellingPrice = product.sellingPrice ?? product.price ?? 0;
                  const mrp = product.mrp ?? 0;

                  return (
                    <tr key={product.id} className="hover:bg-lilac/30 transition">
                      {/* Formula Image & Title */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-lilac border border-lilac-border shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="truncate max-w-[200px]">
                            <p className="font-semibold text-text-dark truncate">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-text-muted truncate">
                              ★ {product.rating ?? 4.9} ({product.reviewCount ?? 120} reviews)
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 font-medium text-text-dark">
                        {product.categoryName || "General"}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                            product.status === "LIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : product.status === "COMING_SOON"
                              ? "bg-purple-50 text-primary border border-purple-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                          title="Click to cycle status: DRAFT -> COMING SOON -> LIVE"
                        >
                          {product.status === "COMING_SOON" ? "Coming Soon" : product.status}
                        </button>
                      </td>

                      {/* Stock with Low Stock Alert */}
                      <td className="py-3.5 px-5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={isLowStock ? "text-rose-600 font-bold" : "text-text-dark"}>
                            {stock} units
                          </span>
                          {isLowStock && (
                            <span className="p-0.5 rounded bg-rose-100 text-rose-700" title="Low stock alert!">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Selling Price / MRP in INR */}
                      <td className="py-3.5 px-5">
                        <p className="font-serif font-bold text-text-dark">
                          ₹{sellingPrice.toLocaleString("en-IN")}
                        </p>
                        {mrp > sellingPrice && (
                          <p className="text-[10px] text-text-muted line-through">
                            MRP: ₹{mrp.toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>

                      {/* Tax & HSN */}
                      <td className="py-3.5 px-5 text-[11px] text-text-gray">
                        <p>GST: {product.gst ?? 18}%</p>
                        <p className="text-[10px] font-mono text-text-muted">HSN: {product.hsn || "330499"}</p>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product.id, product.isFeatured)}
                          className={`p-1.5 rounded-lg transition ${
                            product.isFeatured
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-400 hover:text-text-dark"
                          }`}
                          title="Toggle featured homepage placement"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Best Seller Toggle */}
                      <td className="py-3.5 px-5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBestSeller(product.id, Boolean(product.isBestSeller))}
                          className={`p-1.5 rounded-lg transition ${
                            product.isBestSeller
                              ? "bg-amber-600 text-white"
                              : "bg-gray-100 text-gray-400 hover:text-text-dark"
                          }`}
                          title="Toggle Best Seller designation (/best-sellers)"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-text-gray hover:text-primary hover:bg-lilac transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 rounded-lg text-text-gray hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-text-gray">
          <span>
            Showing {paginated.length} of {filtered.length} products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-lilac transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-text-dark">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-lilac transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Formula Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-text-dark">
                  {editingProduct ? `Edit Formula: ${editingProduct.title}` : "Add New Botanical Formula"}
                </h3>
                <p className="text-xs text-text-gray mt-0.5">
                  Complete pricing, multi-image assets, and status toggle.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-6">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-text-dark uppercase tracking-wider">
                  1. Formula Details & Category
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Formula Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Kumkumadi Royal Saffron Radiance Elixir"
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CRITICAL: Status Dropdown Toggle */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Product Status Toggle *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as "DRAFT" | "COMING_SOON" | "LIVE",
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs font-bold text-primary focus:outline-none focus:border-primary focus:bg-white"
                    >
                      <option value="COMING_SOON">COMING SOON (Visible, Waitlist Modal, Hide Price)</option>
                      <option value="LIVE">LIVE (Visible, Add to Cart & Checkout, Show Price)</option>
                      <option value="DRAFT">DRAFT (Hidden from Storefront)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Editorial Formula Narrative & Sensory Notes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Sensory texture, clinical active benefits, finish..."
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              {/* Section 2: Pricing, Tax & Inventory */}
              <div className="p-4 rounded-2xl bg-lilac/40 border border-lilac-border space-y-4">
                <p className="text-xs font-bold text-text-dark uppercase tracking-wider">
                  2. Pricing (₹ INR), Tax & Inventory Stock
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-serif font-bold text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      MRP (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-serif text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.gst}
                      onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      value={formData.hsn}
                      onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                      placeholder="330499"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Product Photography & Multi-Image Gallery */}
              <div className="space-y-4 p-5 rounded-2xl bg-lilac/30 border border-lilac-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-text-dark uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span>3. Multi-Image Product Gallery & Photo Upload</span>
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Upload multiple photos from your device or paste image URLs. The first photo is your storefront Primary Image.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-full bg-white border border-lilac-border shadow-2xs">
                    {photos.length} Photo{photos.length === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Upload & Add Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option A: Upload Photos from Device */}
                  <div>
                    <input
                      type="file"
                      id="product-photo-file-input"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-photo-file-input"
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-primary/30 bg-white hover:bg-primary/5 cursor-pointer transition text-center group h-full ${
                        uploadingPhoto ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {uploadingPhoto ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary py-3">
                          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          <span>Uploading Photos...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                            <Upload className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-text-dark">
                            Upload Photos from Device
                          </span>
                          <span className="text-[10px] text-text-muted mt-0.5">
                            JPG, PNG, WebP (Multi-select enabled)
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Option B: Paste Direct Image URL */}
                  <div className="flex flex-col justify-between p-4 rounded-xl bg-white border border-gray-200">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-dark mb-1">
                        Add Photo via Web URL
                      </label>
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or Cloudinary URL"
                        className="w-full px-3 py-2 rounded-xl bg-lilac/30 border border-gray-200 text-xs text-text-dark focus:bg-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      disabled={!newPhotoUrl.trim()}
                      className="mt-2 w-full py-2 px-3 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Gallery</span>
                    </button>
                  </div>
                </div>

                {/* Live Visual Gallery Preview */}
                {photos.length > 0 ? (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-text-dark uppercase tracking-wider mb-2">
                      Gallery Preview ({photos.length} Images Loaded)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {photos.map((photo, idx) => (
                        <div
                          key={`photo-${idx}`}
                          className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-2xs group"
                        >
                          <img
                            src={photo}
                            alt={`Product photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Primary Badge or Photo Number */}
                          {idx === 0 ? (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              Primary
                            </span>
                          ) : (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium">
                              #{idx + 1}
                            </span>
                          )}

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white shadow-sm transition"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Make Primary Action (for non-primary photos) */}
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="absolute bottom-2 left-2 right-2 py-1 px-2 rounded-lg bg-white/95 text-primary text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-white transition text-center opacity-90 group-hover:opacity-100"
                            >
                              Set as Primary
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>No photos added yet. Upload from your device or paste a URL above. Primary image is required.</span>
                  </div>
                )}
              </div>

              {/* Section 4: Extended Formulation Dossier */}
              <div className="space-y-4 pt-2">
                <p className="text-xs font-bold text-text-dark uppercase tracking-wider">
                  4. Extended Formulation Dossier
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Full Ingredients List
                  </label>
                  <textarea
                    rows={2}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="Aqua, Niacinamide, Kashmiri Saffron extract, Hyaluronic fractions..."
                    className="w-full px-4 py-2 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Directions & Ritual
                    </label>
                    <textarea
                      rows={2}
                      value={formData.directions}
                      onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                      placeholder="Warm 3–4 drops between palms..."
                      className="w-full px-3 py-2 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Warnings & Age Guidance
                    </label>
                    <textarea
                      rows={2}
                      value={formData.warnings}
                      onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
                      placeholder="For external use only. Ages 16+..."
                      className="w-full px-3 py-2 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Manufacturer / Laboratory
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="Grasse, France / Ahmedabad, India"
                      className="w-full px-3 py-2 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Display Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      max={5}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-lilac/70 border border-lilac-border">
                  <span className="text-xs font-bold text-text-dark">Featured on Homepage Grid</span>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                {/* Best Seller Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-lilac/70 border border-lilac-border">
                  <div>
                    <span className="text-xs font-bold text-text-dark block">Best Seller Formulation</span>
                    <span className="text-[10px] text-text-muted">Showcase formula in the dedicated /best-sellers collection</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
