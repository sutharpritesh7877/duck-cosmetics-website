import { useState } from "react";
import { ProductItem, CategoryName } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

const CATEGORIES: CategoryName[] = ["Baby Care", "Face Wash", "Vapor Rub", "Ortho Pain Oil", "Cosmetics"];

export function ProductsModule() {
  const currentStaff = authService.getCurrentUser();
  const products = db.getProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");

  const canEdit = authService.can("products:update", currentStaff);
  const canCreate = authService.can("products:create", currentStaff);
  const canDelete = authService.can("products:delete", currentStaff);

  const handleOpenEdit = (product: ProductItem) => {
    setEditProduct(product);
    setImagePreview(product.image || "");
    setImageTab(product.image?.startsWith("data:") ? "upload" : "upload");
    setIsNewModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditProduct(null);
    setImagePreview("");
    setImageTab("upload");
    setIsNewModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Auto-compress to max 900px wide
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/webp", 0.88);
          setImagePreview(compressed);
        } else {
          setImagePreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const filtered = products.filter((p) => {
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (stockFilter === "low" && p.stock > p.lowStockThreshold) return false;
    if (stockFilter === "out" && p.stock > 0) return false;
    if (stockFilter === "in" && p.stock <= p.lowStockThreshold) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const productData: ProductItem = {
      id: editProduct?.id || `prd-${Date.now()}`,
      name: formData.get("name") as string,
      category: formData.get("category") as CategoryName,
      sku: formData.get("sku") as string,
      detail: formData.get("detail") as string,
      mrp: Number(formData.get("mrp")),
      price: Number(formData.get("price")),
      costPrice: Number(formData.get("costPrice") || 0),
      stock: Number(formData.get("stock")),
      reservedStock: editProduct?.reservedStock || 0,
      lowStockThreshold: Number(formData.get("lowStockThreshold") || 10),
      hsnCode: (formData.get("hsnCode") as string) || "33049910",
      gstRate: Number(formData.get("gstRate") || 18),
      image: imagePreview || (formData.get("image") as string) || "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?w=600",
      badge: (formData.get("badge") as string) || undefined,
      status: (formData.get("status") as any) || "Active",
      createdAt: editProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveProduct(productData, currentStaff.name, currentStaff.role);
    setToastMessage(`Product "${productData.name}" saved successfully with updated image and details.`);
    setEditProduct(null);
    setIsNewModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) return;
    db.deleteProduct(id, currentStaff.name, currentStaff.role);
    setToastMessage(`Product "${name}" removed.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Product Catalog</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">All Products ({products.length})</h2>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenNew}
            className="rounded-full bg-purple px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark shadow-sm"
          >
            + Add New Product
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {toastMessage}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search products by title, SKU, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="in">Normal Stock</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[55rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">SKU / HSN</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">MRP / Selling</th>
                <th className="px-4 py-3.5">Cost Price</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">GST Rate</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((product) => {
                const isLow = product.stock <= product.lowStockThreshold;
                const isOut = product.stock === 0;

                return (
                  <tr key={product.id} className="transition hover:bg-canvas/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl object-cover border border-purple/10 bg-canvas p-1"
                        />
                        <div>
                          <strong className="block font-semibold text-ink">{product.name}</strong>
                          <span className="text-[10px] text-ink/45 line-clamp-1">{product.detail}</span>
                          {product.badge && (
                            <span className="mt-0.5 inline-block rounded bg-purple/10 px-1.5 py-0.5 text-[8px] font-bold text-purple uppercase">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <div>{product.sku}</div>
                      <small className="text-ink/40">HSN: {product.hsnCode}</small>
                    </td>
                    <td className="px-4 py-3.5 text-ink/65 font-medium">{product.category}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-ink/40 line-through">₹{product.mrp}</span>
                      <strong className="block text-sm text-purple-dark">₹{product.price}</strong>
                    </td>
                    <td className="px-4 py-3.5 text-ink/60">₹{product.costPrice}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          isOut ? "bg-red-100 text-red-700" : isLow ? "bg-amber-100 text-amber-800" : "bg-mint text-purple-dark"
                        }`}
                      >
                        {isOut ? "Out of Stock" : isLow ? `Low (${product.stock})` : `${product.stock} units`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-ink/60 font-medium">{product.gstRate}%</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[9px] font-bold uppercase text-purple-dark">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase transition hover:bg-purple hover:text-white"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="rounded-full border border-red-200 px-3 py-1 text-[10px] font-bold text-red-600 uppercase transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal (Create or Edit) */}
      {(isNewModalOpen || editProduct) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            setIsNewModalOpen(false);
            setEditProduct(null);
          }}
        >
          <form
            onSubmit={handleSaveProduct}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-purple/10 pb-3">
              <h3 className="font-display text-xl font-bold text-purple-dark">
                {editProduct ? `Edit Product: ${editProduct.name}` : "Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  setEditProduct(null);
                }}
                className="grid h-8 w-8 place-items-center rounded-full bg-canvas text-ink/50"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <label className="sm:col-span-2 block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Product Name</span>
                <input
                  name="name"
                  defaultValue={editProduct?.name || ""}
                  required
                  placeholder="e.g. Duck Ortho Pain Oil"
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Category</span>
                <select
                  name="category"
                  defaultValue={editProduct?.category || "Ortho Pain Oil"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">SKU</span>
                <input
                  name="sku"
                  defaultValue={editProduct?.sku || `DUCK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono"
                />
              </label>

              <label className="sm:col-span-2 block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Packaging / Subtitle Detail</span>
                <input
                  name="detail"
                  defaultValue={editProduct?.detail || ""}
                  placeholder="e.g. 12 botanical oils · 100 ml"
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">MRP (₹)</span>
                <input
                  type="number"
                  name="mrp"
                  defaultValue={editProduct?.mrp || 499}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Selling Price (₹)</span>
                <input
                  type="number"
                  name="price"
                  defaultValue={editProduct?.price || 449}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Purchase / Cost Price (₹)</span>
                <input
                  type="number"
                  name="costPrice"
                  defaultValue={editProduct?.costPrice || 200}
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Current Stock</span>
                <input
                  type="number"
                  name="stock"
                  defaultValue={editProduct?.stock ?? 50}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Low Stock Threshold</span>
                <input
                  type="number"
                  name="lowStockThreshold"
                  defaultValue={editProduct?.lowStockThreshold || 15}
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">GST Rate (%)</span>
                <select
                  name="gstRate"
                  defaultValue={editProduct?.gstRate || 18}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value={18}>18% (Standard Cosmetics)</option>
                  <option value={12}>12% (Ayurvedic / Ortho / Balms)</option>
                  <option value={5}>5% (Special Medical Care)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">HSN Code</span>
                <input
                  name="hsnCode"
                  defaultValue={editProduct?.hsnCode || "33049910"}
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Status</span>
                <select
                  name="status"
                  defaultValue={editProduct?.status || "Active"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              {/* Product Image Upload Section */}
              <div className="sm:col-span-2 rounded-2xl border border-purple/15 bg-canvas/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="block font-bold uppercase text-purple text-[9px]">Product Image</span>
                  <div className="flex rounded-full border border-purple/20 bg-white p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageTab("upload")}
                      className={`rounded-full px-3 py-1 font-bold transition ${imageTab === "upload" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"}`}
                    >
                      📁 Upload File from Computer
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("url")}
                      className={`rounded-full px-3 py-1 font-bold transition ${imageTab === "url" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"}`}
                    >
                      🔗 Paste Image Link
                    </button>
                  </div>
                </div>

                {imagePreview && (
                  <div className="flex items-center gap-4 rounded-xl border border-purple/15 bg-white p-3 shadow-xs">
                    <img src={imagePreview} alt="Product Preview" className="h-16 w-16 rounded-xl object-cover border border-purple/10 bg-canvas" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-ink">Active Product Image</p>
                      <p className="text-[10px] text-ink/40 truncate">
                        {imagePreview.startsWith("data:") ? "✓ Direct File Upload (Auto-optimized WebP)" : imagePreview}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImagePreview("")}
                      className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 hover:bg-red-100 uppercase"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {imageTab === "upload" ? (
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple/30 bg-white p-6 cursor-pointer hover:border-purple hover:bg-lilac/20 transition text-center group">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 text-purple group-hover:scale-110 transition" fill="none">
                      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="mt-2 text-xs font-bold text-purple-dark">Click to browse or drop an image file here</span>
                    <span className="mt-1 text-[10px] text-ink/40">Supports PNG, JPG, JPEG, WEBP (auto-compressed for ultra-fast store loading)</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div>
                    <input
                      name="image"
                      value={imagePreview}
                      onChange={(e) => setImagePreview(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px] bg-white"
                    />
                    <small className="block mt-1 text-[10px] text-ink/40">Paste a direct image link from your CDN or image host.</small>
                  </div>
                )}
              </div>

              <label className="sm:col-span-2 block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Badge / Promotional Tag</span>
                <input
                  name="badge"
                  defaultValue={editProduct?.badge || ""}
                  placeholder="e.g. Bestseller, New, Parent Favorite"
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-purple/10 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  setEditProduct(null);
                }}
                className="rounded-full bg-canvas px-5 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-purple px-6 py-2 text-xs font-bold tracking-wider text-white uppercase hover:bg-purple-dark"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
