import { useState } from "react";
import { ProductItem } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function InventoryModule() {
  const currentStaff = authService.getCurrentUser();
  const products = db.getProducts();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low" | "out">("all");
  const [adjustingProduct, setAdjustingProduct] = useState<ProductItem | null>(null);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<any>("Stock Count Audit");
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const canAdjust = authService.can("inventory:adjust", currentStaff);

  const filtered = products.filter((p) => {
    if (filterType === "low" && (p.stock > p.lowStockThreshold || p.stock === 0)) return false;
    if (filterType === "out" && p.stock > 0) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
    }
    return true;
  });

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCostValuation = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleApplyAdjustment = () => {
    if (!adjustingProduct || changeAmount === 0) return;
    const ok = db.adjustStock(
      adjustingProduct.id,
      changeAmount,
      adjustmentReason,
      adjustmentNotes || "Manual stock adjustment",
      currentStaff.name,
      currentStaff.role
    );

    if (ok) {
      setToastMessage(`Adjusted ${changeAmount >= 0 ? "+" : ""}${changeAmount} units for ${adjustingProduct.name}.`);
      setAdjustingProduct(null);
      setChangeAmount(0);
      setAdjustmentNotes("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Stock & Warehouse</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Inventory Management</h2>
        </div>
      </div>

      {toastMessage && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {toastMessage}
        </div>
      )}

      {/* Inventory KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Total Inventory In Stock</p>
          <p className="mt-2 font-display text-3xl font-bold text-purple-dark">{totalUnits} units</p>
          <p className="mt-1 text-xs text-ink/50">Across {products.length} SKUs</p>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Warehouse Cost Valuation</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink">₹{totalCostValuation.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-ink/50">Retail value: ₹{totalRetailValuation.toLocaleString("en-IN")}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">Low Stock Alerts</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-700">{lowStockCount} items</p>
          <button onClick={() => setFilterType("low")} className="mt-1 text-xs font-bold text-amber-900 underline">
            Filter low stock →
          </button>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-red-800 uppercase">Out of Stock</p>
          <p className="mt-2 font-display text-3xl font-bold text-red-600">{outOfStockCount} items</p>
          <button onClick={() => setFilterType("out")} className="mt-1 text-xs font-bold text-red-700 underline">
            Filter out of stock →
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Filter by product name, SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <div className="flex items-center gap-1.5 rounded-xl border border-purple/15 bg-canvas p-1 text-xs">
          {[
            { key: "all", label: "All Items" },
            { key: "low", label: "Low Stock Alert" },
            { key: "out", label: "Out of Stock" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key as any)}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filterType === f.key ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Threshold</th>
                <th className="px-4 py-3.5">Stock Status</th>
                <th className="px-4 py-3.5">Cost Value</th>
                <th className="px-4 py-3.5">Retail Value</th>
                <th className="px-4 py-3.5 text-right">Adjustment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((item) => {
                const isOut = item.stock === 0;
                const isLow = item.stock <= item.lowStockThreshold && !isOut;

                return (
                  <tr key={item.id} className="transition hover:bg-canvas/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover bg-canvas p-0.5 border" />
                        <div>
                          <strong className="block font-semibold text-ink">{item.name}</strong>
                          <span className="font-mono text-[10px] text-ink/40">{item.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-ink/60 font-medium">{item.category}</td>
                    <td className="px-4 py-3.5 text-ink/50 font-mono">Min {item.lowStockThreshold} units</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          isOut ? "bg-red-100 text-red-700 font-bold" : isLow ? "bg-amber-100 text-amber-800" : "bg-mint text-purple-dark"
                        }`}
                      >
                        {isOut ? "Out of Stock (0)" : isLow ? `Low Stock (${item.stock})` : `${item.stock} Available`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium">₹{(item.stock * item.costPrice).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 font-bold text-purple-dark">₹{(item.stock * item.price).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 text-right">
                      {canAdjust && (
                        <button
                          onClick={() => {
                            setAdjustingProduct(item);
                            setChangeAmount(0);
                            setAdjustmentNotes("");
                          }}
                          className="rounded-full bg-purple/10 px-3.5 py-1 text-[10px] font-bold text-purple uppercase transition hover:bg-purple hover:text-white"
                        >
                          Adjust Stock
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

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setAdjustingProduct(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Stock Ledger Adjustment</p>
                <h3 className="font-display text-xl font-bold text-purple-dark">{adjustingProduct.name}</h3>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="grid h-8 w-8 place-items-center rounded-full bg-canvas">✕</button>
            </div>

            <div className="rounded-xl bg-canvas p-3 text-xs flex justify-between">
              <span>Current Stock on Record:</span>
              <strong className="font-bold text-purple-dark">{adjustingProduct.stock} units</strong>
            </div>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Quantity to Add (+) or Deduct (-)</span>
              <input
                type="number"
                value={changeAmount}
                onChange={(e) => setChangeAmount(Number(e.target.value))}
                placeholder="e.g. 50 or -10"
                className="w-full rounded-xl border border-purple/20 p-2.5 font-mono text-base font-bold outline-none"
              />
              <small className="mt-1 block text-ink/40">New resulting stock: <strong>{Math.max(0, adjustingProduct.stock + changeAmount)}</strong> units</small>
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Adjustment Audit Reason</span>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full rounded-xl border border-purple/20 bg-white p-2.5 outline-none font-medium"
              >
                <option value="Stock Count Audit">Stock Count Audit / Physical Count</option>
                <option value="Supplier Restock">Supplier Delivery Restock</option>
                <option value="Damaged / Spoiled">Damaged / Leakage / Expired</option>
                <option value="Return Approved">Return Restocked for Resale</option>
                <option value="Promotional Sample">Promotional Giveaway / Marketing Sample</option>
                <option value="Correction">Data Entry Correction</option>
              </select>
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Notes / Batch Details</span>
              <input
                type="text"
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="e.g. Batch #2026-10 reconciliation"
                className="w-full rounded-xl border border-purple/15 p-2 text-xs outline-none"
              />
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setAdjustingProduct(null)} className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase">
                Cancel
              </button>
              <button
                onClick={handleApplyAdjustment}
                disabled={changeAmount === 0}
                className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark disabled:opacity-40"
              >
                Confirm & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
