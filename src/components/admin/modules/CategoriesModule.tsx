import { useState } from "react";
import { CategoryName } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

interface CategoryMeta {
  name: CategoryName;
  tagline: string;
  image: string;
  tone: string;
  displayOrder: number;
  active: boolean;
}

const DEFAULT_CATEGORIES_META: CategoryMeta[] = [
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
  const products = db.getProducts();
  const [categories, setCategories] = useState<CategoryMeta[]>(DEFAULT_CATEGORIES_META);
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const [savedMsg, setSavedMsg] = useState("");

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;
    const form = new FormData(e.currentTarget);
    const updated: CategoryMeta = {
      ...editingCategory,
      tagline: form.get("tagline") as string,
      image: form.get("image") as string,
      displayOrder: Number(form.get("displayOrder") || 1),
      active: form.get("active") === "true",
    };

    setCategories((prev) => prev.map((c) => (c.name === updated.name ? updated : c)));
    db.addAuditLog({
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      staffRole: currentStaff.role,
      action: `Updated Category Metadata: ${updated.name}`,
      module: "Categories",
      details: `Tagline: ${updated.tagline}, Active: ${updated.active}`,
    });

    setSavedMsg(`Category "${updated.name}" updated successfully.`);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Store Taxonomy</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Product Categories ({categories.length})</h2>
        </div>
      </div>

      {savedMsg && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {savedMsg}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
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

              <div className="border-t border-purple/10 p-4 bg-canvas/40 flex justify-end">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="rounded-full bg-purple px-4 py-1.5 text-xs font-bold text-white uppercase hover:bg-purple-dark transition"
                >
                  Edit Category
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditingCategory(null)}>
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display text-xl font-bold text-purple-dark">Edit: {editingCategory.name}</h3>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Tagline / Marketing Line</span>
              <input
                name="tagline"
                defaultValue={editingCategory.tagline}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Banner Image URL</span>
              <input
                name="image"
                defaultValue={editingCategory.image}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3 text-xs">
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
                onClick={() => setEditingCategory(null)}
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
