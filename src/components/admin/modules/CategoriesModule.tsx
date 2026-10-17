import { useState, useEffect } from "react";
import { CategoryMeta } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { isFirebaseConfigured, getFirebaseConfigStatus } from "../../../lib/firebase";
import {
  fetchCategoriesFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
} from "../../../backend/firebaseService";
import {
  uploadImageToCloudinary,
  isCloudinaryConfigured,
} from "../../../lib/cloudinaryClient";

export const DEFAULT_CATEGORIES_META: CategoryMeta[] = [
  {
    name: "Baby Care",
    tagline: "Gentle from day one · Tear-free & pure",
    image: "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-lilac",
    displayOrder: 1,
    active: true,
  },
  {
    name: "Face Wash",
    tagline: "Fresh, balanced skin · Aloe + green tea",
    image: "https://images.unsplash.com/photo-1617858123189-b26eb62d8eb4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-mint",
    displayOrder: 2,
    active: true,
  },
  {
    name: "Vapor Rub",
    tagline: "Breathe easy comfort · Eucalyptus & mint",
    image: "https://images.unsplash.com/photo-1671493234254-15fc6c91aa87?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-sky",
    displayOrder: 3,
    active: true,
  },
  {
    name: "Ortho Pain Oil",
    tagline: "Herbal everyday relief · 12 botanical oils",
    image: "https://images.unsplash.com/photo-1671493229066-f36e86b35841?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-sage",
    displayOrder: 4,
    active: true,
  },
  {
    name: "Cosmetics",
    tagline: "Color that feels good · Skin tints & glow duos",
    image: "https://images.unsplash.com/photo-1643168186368-c42359c82573?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-blush",
    displayOrder: 5,
    active: true,
  },
];

export function CategoriesModule() {
  const currentStaff = authService.getCurrentUser();
  const [products, setProducts] = useState(db.getProducts());
  const [categories, setCategories] = useState<CategoryMeta[]>(() => {
    const s = db.getSettings();
    return s.customCategories && s.customCategories.length > 0 ? s.customCategories : DEFAULT_CATEGORIES_META;
  });

  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const canManage = authService.can("products:update", currentStaff) || currentStaff.role === "Owner / Super Admin";

  useEffect(() => {
    let isMounted = true;
    if (isFirebaseConfigured()) {
      fetchCategoriesFromFirestore()
        .then((cats) => {
          if (isMounted && cats.length > 0) {
            setCategories(cats);
          }
        })
        .catch((err) => console.error("Error loading categories from Firestore:", err));
    }

    const unsub = db.subscribe(() => {
      setProducts([...db.getProducts()]);
      if (!isFirebaseConfigured()) {
        const s = db.getSettings();
        if (s.customCategories && s.customCategories.length > 0) {
          setCategories([...s.customCategories]);
        }
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const persistCategories = async (updatedCategories: CategoryMeta[], actionLog: string) => {
    // If Firebase is configured, sync to Firestore categories collection
    if (isFirebaseConfigured()) {
      try {
        for (const cat of updatedCategories) {
          await saveCategoryToFirestore(cat);
        }
      } catch (err: any) {
        console.error("Firestore category save error:", err);
      }
    }

    const settings = db.getSettings();
    db.saveSettings(
      {
        ...settings,
        customCategories: updatedCategories,
      },
      currentStaff.name,
      currentStaff.role
    );
    setCategories(updatedCategories);
    db.addAuditLog({
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      action: actionLog,
      module: "Categories",
      details: `Total Categories: ${updatedCategories.length}`,
    });
    db.notify();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    if (isCloudinaryConfigured()) {
      try {
        setSavedMsg("Uploading category banner to Cloudinary CDN...");
        const res = await uploadImageToCloudinary(file, "duck_categories");
        setImagePreview(res.url);
        setSavedMsg("✓ Category image uploaded to Cloudinary CDN.");
        e.target.value = "";
        return;
      } catch (err: any) {
        console.error("Cloudinary category upload failed:", err);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
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
          setImagePreview(canvas.toDataURL("image/webp", 0.85));
        } else {
          setImagePreview(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;
    const form = new FormData(e.currentTarget);
    const newName = (form.get("name") as string).trim();
    const oldName = editingCategory.name;

    const updated: CategoryMeta = {
      name: newName,
      tagline: (form.get("tagline") as string).trim(),
      image: imagePreview || (form.get("image") as string).trim(),
      tone: (form.get("tone") as string) || editingCategory.tone || "bg-lilac",
      displayOrder: Number(form.get("displayOrder") || 1),
      active: form.get("active") === "true",
    };

    const updatedList = categories.map((c) => (c.name === oldName ? updated : c));

    // If category was renamed, update all associated products in db
    if (newName !== oldName) {
      const allProds = db.getProducts();
      allProds.forEach((p) => {
        if (p.category === oldName) {
          db.saveProduct({ ...p, category: newName }, currentStaff.name, currentStaff.role);
        }
      });
    }

    persistCategories(updatedList, `Updated Category: ${updated.name}`);
    setSavedMsg(`Category "${updated.name}" updated successfully.`);
    setEditingCategory(null);
    setImagePreview("");
  };

  const handleCreateCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string).trim();
    if (!name) return;

    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert(`A category named "${name}" already exists.`);
      return;
    }

    const newCategory: CategoryMeta = {
      name,
      tagline: (form.get("tagline") as string).trim() || "Gentle care for daily life",
      image: imagePreview || (form.get("image") as string).trim() || "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?w=800",
      tone: (form.get("tone") as string) || "bg-lilac",
      displayOrder: Number(form.get("displayOrder") || categories.length + 1),
      active: form.get("active") === "true",
    };

    const updatedList = [...categories, newCategory];
    persistCategories(updatedList, `Created Category: ${newCategory.name}`);
    setSavedMsg(`Category "${newCategory.name}" added successfully.`);
    setIsNewModalOpen(false);
    setImagePreview("");
  };

  const handleDeleteCategory = async (categoryName: string) => {
    const linkedProducts = products.filter((p) => p.category === categoryName);
    if (linkedProducts.length > 0) {
      const confirmDelete = confirm(
        `There are ${linkedProducts.length} product(s) in category "${categoryName}". If you delete this category, these products will be moved to "Uncategorized". Do you want to proceed?`
      );
      if (!confirmDelete) return;

      // Reassign products to Uncategorized
      linkedProducts.forEach((p) => {
        db.saveProduct({ ...p, category: "Uncategorized" as any }, currentStaff.name, currentStaff.role);
      });
    } else {
      if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) return;
    }

    if (isFirebaseConfigured()) {
      try {
        await deleteCategoryFromFirestore(categoryName);
      } catch (err: any) {
        console.error("Error deleting category from Firestore:", err);
      }
    }

    const updatedList = categories.filter((c) => c.name !== categoryName);
    persistCategories(updatedList, `Deleted Category: ${categoryName}`);
    setSavedMsg(`Category "${categoryName}" removed.`);
  };

  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const dbConfigStatus = getFirebaseConfigStatus();

  return (
    <div className="space-y-6">
      {/* Firebase Firestore Connection Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
          dbConfigStatus.configured
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
            : "border-amber-200 bg-amber-50/80 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              dbConfigStatus.configured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>
            {dbConfigStatus.configured
              ? `Categories Synced with Google Firebase Firestore (Project: ${dbConfigStatus.projectId})`
              : "Database Notice: Firebase credentials not found in environment."}
          </span>
        </div>
        {!dbConfigStatus.configured && (
          <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
            Missing: {dbConfigStatus.missingFields.join(", ")}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Store Taxonomy & Navigation</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Product Categories ({categories.length})</h2>
          <p className="text-xs text-ink/50 mt-1">
            Add, edit, or remove store categories. All changes sync immediately to the website header, shelf filters, and mega menu.
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setImagePreview("");
              setIsNewModalOpen(true);
            }}
            className="rounded-full bg-purple px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark shadow-sm"
          >
            + Add New Category
          </button>
        )}
      </div>

      {savedMsg && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {savedMsg}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((category) => {
          const productCount = products.filter((p) => p.category === category.name).length;
          return (
            <div
              key={category.name}
              className="overflow-hidden rounded-3xl border border-purple/10 bg-white shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-canvas">
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] font-bold text-purple shadow-xs">
                    Order #{category.displayOrder}
                  </span>
                  <span
                    className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[9px] font-bold uppercase ${
                      category.active ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.active ? "Active" : "Hidden"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-bold text-purple-dark">{category.name}</h3>
                    <span className="rounded-full bg-lilac/70 px-2.5 py-1 text-xs font-bold text-purple">
                      {productCount} products
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-ink/60 leading-relaxed">{category.tagline}</p>
                </div>
              </div>

              <div className="border-t border-purple/10 p-4 bg-canvas/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category.name)}
                  className="text-xs font-bold text-red-600 hover:text-red-800 transition uppercase"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setImagePreview(category.image);
                  }}
                  className="rounded-full bg-purple px-4 py-1.5 text-xs font-bold text-white uppercase hover:bg-purple-dark transition"
                >
                  Edit Category
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Category Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsNewModalOpen(false)}>
          <form
            onSubmit={handleCreateCategory}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-display text-2xl font-bold text-purple-dark">Add New Category</h3>
            <p className="text-xs text-ink/50">Create a new category for products in your catalog.</p>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Category Name *</span>
              <input
                name="name"
                required
                placeholder="e.g. Hair Care, Sunscreen, Body Lotion"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Tagline / Marketing Line</span>
              <input
                name="tagline"
                placeholder="e.g. Nourishing botanical moisture for all hair types"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            {/* Image Upload / URL */}
            <div className="rounded-2xl border border-purple/15 bg-canvas/60 p-3.5 space-y-2.5 text-xs">
              <span className="block font-bold uppercase text-purple text-[9px]">Category Banner Image</span>
              {imagePreview && (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple/15">
                  <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-lg object-cover bg-canvas" />
                  <span className="text-[10px] text-ink/60 truncate flex-1">Image selected</span>
                  <button type="button" onClick={() => setImagePreview("")} className="text-red-600 text-[10px] font-bold">Clear</button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-purple/30 bg-white p-3 cursor-pointer hover:border-purple">
                  <span className="text-[10px] font-bold text-purple">📁 Upload from Device</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <div>
                  <input
                    name="image"
                    value={imagePreview}
                    onChange={(e) => setImagePreview(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full h-full rounded-xl border border-purple/15 p-2 font-mono text-[10px] bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Display Order</span>
                <input
                  type="number"
                  name="displayOrder"
                  defaultValue={categories.length + 1}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Background Tone</span>
                <select
                  name="tone"
                  defaultValue="bg-lilac"
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="bg-lilac">Lilac (Soft Purple)</option>
                  <option value="bg-mint">Mint (Soft Green)</option>
                  <option value="bg-sky">Sky (Soft Blue)</option>
                  <option value="bg-sage">Sage (Earthy Olive)</option>
                  <option value="bg-blush">Blush (Soft Pink)</option>
                  <option value="bg-amber-50">Warm Amber</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Status</span>
                <select
                  name="active"
                  defaultValue="true"
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  setImagePreview("");
                }}
                className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditingCategory(null)}>
          <form
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="font-display text-2xl font-bold text-purple-dark">Edit: {editingCategory.name}</h3>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Category Name *</span>
              <input
                name="name"
                defaultValue={editingCategory.name}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Tagline / Marketing Line</span>
              <input
                name="tagline"
                defaultValue={editingCategory.tagline}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            {/* Image Upload / URL */}
            <div className="rounded-2xl border border-purple/15 bg-canvas/60 p-3.5 space-y-2.5 text-xs">
              <span className="block font-bold uppercase text-purple text-[9px]">Category Banner Image</span>
              {imagePreview && (
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple/15">
                  <img src={imagePreview} alt="Preview" className="h-14 w-14 rounded-lg object-cover bg-canvas" />
                  <span className="text-[10px] text-ink/60 truncate flex-1">
                    {imagePreview.startsWith("data:") ? "Direct Upload (WebP)" : imagePreview}
                  </span>
                  <button type="button" onClick={() => setImagePreview("")} className="text-red-600 text-[10px] font-bold">Clear</button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-purple/30 bg-white p-3 cursor-pointer hover:border-purple">
                  <span className="text-[10px] font-bold text-purple">📁 Upload New Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <div>
                  <input
                    name="image"
                    value={imagePreview}
                    onChange={(e) => setImagePreview(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full h-full rounded-xl border border-purple/15 p-2 font-mono text-[10px] bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Display Order</span>
                <input
                  type="number"
                  name="displayOrder"
                  defaultValue={editingCategory.displayOrder}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Background Tone</span>
                <select
                  name="tone"
                  defaultValue={editingCategory.tone || "bg-lilac"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="bg-lilac">Lilac (Soft Purple)</option>
                  <option value="bg-mint">Mint (Soft Green)</option>
                  <option value="bg-sky">Sky (Soft Blue)</option>
                  <option value="bg-sage">Sage (Earthy Olive)</option>
                  <option value="bg-blush">Blush (Soft Pink)</option>
                  <option value="bg-amber-50">Warm Amber</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Status</span>
                <select
                  name="active"
                  defaultValue={editingCategory.active ? "true" : "false"}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none"
                >
                  <option value="true">Active in Navigation</option>
                  <option value="false">Hidden</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setImagePreview("");
                }}
                className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
