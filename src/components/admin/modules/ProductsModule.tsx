import { useState, useEffect } from "react";
import { ProductItem, CategoryName } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { DEFAULT_CATEGORIES_META } from "./CategoriesModule";
import { isFirebaseConfigured, getFirebaseConfigStatus } from "../../../lib/firebase";
import {
  fetchAdminProductsFromFirestore,
  fetchCategoriesFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
} from "../../../backend/firebaseService";
import {
  uploadImageToCloudinary,
  isCloudinaryConfigured,
  getCloudinaryConfig,
} from "../../../lib/cloudinaryClient";

const GALLERY_SLOT_LABELS = [
  "1. Front / Primary View",
  "2. Back / Ingredients & Info",
  "3. Texture / Close-up Swatch",
  "4. Outer Box & Packaging",
  "5. In-Use / Lifestyle",
];

export function ProductsModule() {
  const currentStaff = authService.getCurrentUser();
  const [products, setProducts] = useState<ProductItem[]>(db.getProducts());
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [categories, setCategories] = useState<string[]>(() => {
    const s = db.getSettings();
    if (s.customCategories && s.customCategories.length > 0) {
      return s.customCategories.map((c) => c.name);
    }
    return DEFAULT_CATEGORIES_META.map((c) => c.name);
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Multiple images state
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");

  const canEdit = authService.can("products:update", currentStaff) || currentStaff.role === "Owner / Super Admin";
  const canCreate = authService.can("products:create", currentStaff) || currentStaff.role === "Owner / Super Admin";
  const canDelete = authService.can("products:delete", currentStaff) || currentStaff.role === "Owner / Super Admin";

  useEffect(() => {
    let isMounted = true;

    // Load from Firebase Firestore if configured
    if (isFirebaseConfigured()) {
      setIsFirebaseLoading(true);
      fetchAdminProductsFromFirestore()
        .then((data) => {
          if (isMounted) {
            if (data.length > 0) setProducts(data);
            setIsFirebaseLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load products from Firestore:", err);
          if (isMounted) setIsFirebaseLoading(false);
        });

      fetchCategoriesFromFirestore()
        .then((cats) => {
          if (isMounted && cats.length > 0) {
            setCategories(cats.map((c) => c.name));
          }
        })
        .catch((err) => {
          console.error("Failed to load categories from Firestore:", err);
        });
    }

    const unsub = db.subscribe(() => {
      if (!isFirebaseConfigured()) {
        setProducts([...db.getProducts()]);
      }
      const s = db.getSettings();
      if (s.customCategories && s.customCategories.length > 0) {
        setCategories(s.customCategories.map((c) => c.name));
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleOpenEdit = (product: ProductItem) => {
    setEditProduct(product);
    const existing = product.images && product.images.length > 0
      ? [...product.images]
      : (product.image ? [product.image] : []);
    setImagesList(existing);
    setNewImageUrl("");
    setImageTab("upload");
    setIsNewModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditProduct(null);
    setImagesList([]);
    setNewImageUrl("");
    setImageTab("upload");
    setIsNewModalOpen(true);
  };

  const compressAndAddImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
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
            resolve(canvas.toDataURL("image/webp", 0.88));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      alert("Please select valid image files (PNG, JPG, WEBP).");
      return;
    }

    const availableSlots = Math.max(0, 5 - imagesList.length);
    if (availableSlots <= 0) {
      alert("Maximum 5 gallery slots reached (Front, Back, Texture, Packaging, In-Use). Remove an image to upload a new one.");
      return;
    }

    const filesToUpload = validFiles.slice(0, availableSlots);

    if (isCloudinaryConfigured()) {
      setIsUploadingToCloudinary(true);
      try {
        const uploadPromises = filesToUpload.map((file) => uploadImageToCloudinary(file, "duck_products"));
        const results = await Promise.all(uploadPromises);
        const uploadedUrls = results.map((r) => r.url);
        setImagesList((prev) => [...prev, ...uploadedUrls].slice(0, 5));
        setToastMessage(`✓ ${results.length} image(s) uploaded to Cloudinary CDN successfully.`);
      } catch (err: any) {
        console.error("Cloudinary upload failed, falling back to local compression:", err);
        alert(`Cloudinary upload warning: ${err.message}. Using compressed preview.`);
        const compressedResults = await Promise.all(filesToUpload.map(compressAndAddImage));
        setImagesList((prev) => [...prev, ...compressedResults].slice(0, 5));
      } finally {
        setIsUploadingToCloudinary(false);
      }
    } else {
      const compressedResults = await Promise.all(filesToUpload.map(compressAndAddImage));
      setImagesList((prev) => [...prev, ...compressedResults].slice(0, 5));
      setToastMessage("Note: Cloudinary not configured in .env. Using compressed preview.");
    }
    e.target.value = "";
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (imagesList.length >= 5) {
      alert("You can add up to 5 images per product (Front, Back, Texture, Packaging, In-Use).");
      return;
    }
    setImagesList((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImagesList((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
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

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const primaryImg = imagesList[0] || (formData.get("image") as string) || "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?w=600";
    const galleryImages = imagesList.length > 0 ? imagesList : [primaryImg];

    const productData: ProductItem = {
      id: editProduct?.id || `prd-${Date.now()}`,
      name: (formData.get("name") as string).trim(),
      category: formData.get("category") as CategoryName,
      sku: (formData.get("sku") as string).trim(),
      detail: (formData.get("detail") as string).trim(),
      mrp: Number(formData.get("mrp")),
      price: Number(formData.get("price")),
      costPrice: Number(formData.get("costPrice") || 0),
      stock: Number(formData.get("stock")),
      reservedStock: editProduct?.reservedStock || 0,
      lowStockThreshold: Number(formData.get("lowStockThreshold") || 10),
      hsnCode: (formData.get("hsnCode") as string) || "33049910",
      gstRate: Number(formData.get("gstRate") || 18),
      image: primaryImg,
      images: galleryImages,
      badge: ((formData.get("badge") as string) || "").trim(),
      status: (formData.get("status") as any) || "Active",
      createdAt: editProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured()) {
      try {
        const saved = await saveProductToFirestore(productData);
        setProducts((prev) => {
          const idx = prev.findIndex((p) => p.id === saved.id || p.sku === saved.sku);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
        // Mirror to local memory engine for immediate reactivity
        db.saveProduct(saved, currentStaff.name, currentStaff.role);
        setToastMessage(`Product "${saved.name}" successfully saved to Google Firebase Firestore!`);
      } catch (err: any) {
        console.error("Firebase product save error:", err);
        // Save to local engine so admin changes are NOT lost!
        db.saveProduct(productData, currentStaff.name, currentStaff.role);
        setProducts((prev) => {
          const idx = prev.findIndex((p) => p.id === productData.id || p.sku === productData.sku);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = productData;
            return next;
          }
          return [productData, ...prev];
        });
        setToastMessage(`Product saved to catalog. Firestore sync note: ${err.message}`);
      }
    } else {
      db.saveProduct(productData, currentStaff.name, currentStaff.role);
      setToastMessage(`Product "${productData.name}" saved with ${galleryImages.length} image(s). Changes are live.`);
    }

    setEditProduct(null);
    setIsNewModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) return;

    if (isFirebaseConfigured()) {
      try {
        await deleteProductFromFirestore(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        db.deleteProduct(id, currentStaff.name, currentStaff.role);
        setToastMessage(`Product "${name}" removed from Firestore database.`);
      } catch (err: any) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        db.deleteProduct(id, currentStaff.name, currentStaff.role);
        setToastMessage(`Product "${name}" removed from catalog.`);
      }
      return;
    } else {
      db.deleteProduct(id, currentStaff.name, currentStaff.role);
      setToastMessage(`Product "${name}" removed.`);
    }
  };

  const fbConfigStatus = getFirebaseConfigStatus();
  const cloudinaryStatus = getCloudinaryConfig();

  return (
    <div className="space-y-6">
      {/* Firebase Firestore Connection Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
          fbConfigStatus.configured
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
            : "border-amber-200 bg-amber-50/80 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              fbConfigStatus.configured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <div>
            <span>
              {fbConfigStatus.configured
                ? `Google Firebase Firestore Connected (Project: ${fbConfigStatus.projectId})`
                : "Database Notice: Firebase credentials not found in environment."}
            </span>
            {isFirebaseLoading && <span className="ml-2 text-ink/40 font-normal">(Syncing Firestore products...)</span>}
          </div>
        </div>
        {!fbConfigStatus.configured && (
          <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
            Missing: {fbConfigStatus.missingFields.join(", ")}
          </span>
        )}
      </div>

      {/* Cloudinary CDN Image Storage Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
          cloudinaryStatus.configured
            ? "border-sky-200 bg-sky-50/80 text-sky-900"
            : "border-purple/15 bg-white text-purple-dark"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              cloudinaryStatus.configured ? "bg-sky-500 animate-pulse" : "bg-amber-400"
            }`}
          />
          <div>
            <span>
              {cloudinaryStatus.configured
                ? `Cloudinary CDN Active: Storing product photos on cloud "${cloudinaryStatus.cloudName}" (Preset: ${cloudinaryStatus.uploadPreset})`
                : "Cloudinary CDN Storage: Set VITE_CLOUDINARY_CLOUD_NAME & VITE_CLOUDINARY_UPLOAD_PRESET to store photos on Cloudinary CDN."}
            </span>
            {isUploadingToCloudinary && (
              <span className="ml-2 font-bold text-purple animate-pulse">Uploading photos to Cloudinary CDN...</span>
            )}
          </div>
        </div>
        {!cloudinaryStatus.configured ? (
          <span className="text-[10px] text-purple bg-purple/10 px-2.5 py-1 rounded-full font-bold">
            Cloudinary Ready
          </span>
        ) : (
          <span className="text-[10px] text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full font-bold">
            CDN Active
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Product Catalog</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">All Products ({products.length})</h2>
          <p className="text-xs text-ink/50 mt-1">
            Manage your store catalog, multiple product gallery photos, stock levels, and Indian tax compliance.
          </p>
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
          type="search"
          placeholder="Search product by name, SKU, category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-72 rounded-xl border border-purple/15 px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-medium text-ink outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-medium text-ink outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-3xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/50 text-[10px] font-bold tracking-wider text-purple uppercase">
                <th className="px-4 py-3.5">Product & Images</th>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-ink/40">
                    No products found. Click "+ Add New Product" to create your first product.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isLow = product.stock <= product.lowStockThreshold;
                  const isOut = product.stock === 0;
                  const totalImages = (product.images && product.images.length > 0) ? product.images.length : (product.image ? 1 : 0);

                  return (
                    <tr key={product.id} className="transition hover:bg-canvas/30">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={product.image || product.images?.[0]}
                              alt={product.name}
                              className="h-12 w-12 rounded-xl object-cover border border-purple/10 bg-canvas"
                            />
                            {totalImages > 1 && (
                              <span className="absolute -bottom-1 -right-1 rounded-full bg-purple px-1.5 py-0.2 text-[8px] font-bold text-white shadow-xs">
                                {totalImages} imgs
                              </span>
                            )}
                          </div>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsNewModalOpen(false)}>
          <form
            onSubmit={handleSaveProduct}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6"
          >
            <div>
              <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Catalog Editor</span>
              <h3 className="font-display text-2xl font-bold text-purple-dark">
                {editProduct ? `Edit: ${editProduct.name}` : "Add New Product"}
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <label className="sm:col-span-2 block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Product Name *</span>
                <input
                  name="name"
                  defaultValue={editProduct?.name || ""}
                  required
                  placeholder="e.g. Duck Ortho Pain Oil"
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Category *</span>
                <select
                  name="category"
                  defaultValue={editProduct?.category || categories[0] || "Baby Care"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">SKU *</span>
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
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">MRP (₹) *</span>
                <input
                  type="number"
                  name="mrp"
                  defaultValue={editProduct?.mrp || 499}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Selling Price (₹) *</span>
                <input
                  type="number"
                  name="price"
                  defaultValue={editProduct?.price || 449}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-bold text-purple-dark"
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
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Current Stock *</span>
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
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
                >
                  <option value="Active">Active (Visible on website)</option>
                  <option value="Draft">Draft (Admin only)</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              {/* Multiple Product Images Gallery Manager */}
              <div className="sm:col-span-2 rounded-2xl border border-purple/15 bg-canvas/60 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="block font-bold uppercase text-purple text-[9px]">
                      Multiple Product Images Gallery ({imagesList.length}/5)
                    </span>
                    <p className="text-[10px] text-ink/50">
                      Upload multiple images to fill the 5 storefront gallery views: Front, Back, Texture, Pack, and In-Use.
                    </p>
                  </div>
                  <div className="flex rounded-full border border-purple/20 bg-white p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageTab("upload")}
                      className={`rounded-full px-3 py-1 font-bold transition ${imageTab === "upload" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"}`}
                    >
                      📁 Upload Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab("url")}
                      className={`rounded-full px-3 py-1 font-bold transition ${imageTab === "url" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"}`}
                    >
                      🔗 Add by URL
                    </button>
                  </div>
                </div>

                {/* Upload Area */}
                {imageTab === "upload" ? (
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple/30 bg-white p-5 cursor-pointer hover:border-purple hover:bg-lilac/20 transition text-center group">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 text-purple group-hover:scale-110 transition" fill="none">
                      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="mt-2 text-xs font-bold text-purple-dark">
                      {isUploadingToCloudinary
                        ? "⏳ Uploading photos directly to Cloudinary CDN..."
                        : "Click to browse or drop multiple images here (Select 1 to 5 files)"}
                    </span>
                    <span className="mt-1 text-[10px] text-ink/40">
                      {cloudinaryStatus.configured
                        ? "Cloudinary CDN Active · Unlimited high-res images with fast global delivery"
                        : "PNG, JPG, JPEG, WEBP · Set Cloudinary keys in .env for production CDN storage"}
                    </span>
                    <input
                      type="file"
                      multiple
                      disabled={isUploadingToCloudinary}
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                      onChange={handleMultipleImageFiles}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="rounded-xl bg-purple px-4 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
                    >
                      Add Image
                    </button>
                  </div>
                )}

                {/* Gallery Slots Preview Grid */}
                {imagesList.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[9px] font-bold uppercase text-purple">
                      Configured Gallery Views (First image is storefront primary):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {imagesList.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl border border-purple/20 bg-white p-2 flex flex-col justify-between shadow-xs"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-lg bg-canvas">
                            <img src={imgUrl} alt={`Slot ${idx + 1}`} className="h-full w-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 rounded bg-purple px-1.5 py-0.5 text-[8px] font-bold text-white uppercase shadow-xs">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="mt-1.5 block text-[9px] font-bold text-purple-dark truncate">
                            {GALLERY_SLOT_LABELS[idx] || `Image ${idx + 1}`}
                          </span>
                          <div className="mt-1 flex items-center justify-between border-t border-purple/10 pt-1 text-[9px]">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="font-bold text-purple hover:underline"
                              >
                                Set Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="font-bold text-red-600 hover:text-red-800 ml-auto"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                className="rounded-full bg-purple px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-purple-dark shadow-sm"
              >
                Save Product & Sync to Website
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
