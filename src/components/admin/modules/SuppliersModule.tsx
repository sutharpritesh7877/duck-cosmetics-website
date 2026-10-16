import { useState } from "react";
import { Supplier, PurchaseOrder } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function SuppliersModule() {
  const currentStaff = authService.getCurrentUser();
  const suppliers = db.getSuppliers();
  const purchaseOrders = db.getPurchaseOrders();
  const products = db.getProducts();

  const [activeTab, setActiveTab] = useState<"pos" | "suppliers">("pos");
  const [feedback, setFeedback] = useState("");
  const [isNewPoOpen, setIsNewPoOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [poQuantity, setPoQuantity] = useState(100);
  const [poUnitCost, setPoUnitCost] = useState(150);

  const canManage = authService.can("suppliers:manage", currentStaff);

  const handleReceivePo = (po: PurchaseOrder) => {
    // Automatically update inventory for each item!
    po.items.forEach((item) => {
      db.adjustStock(
        item.productId,
        item.quantity,
        "Supplier Restock",
        `Received shipment against Purchase Order ${po.poNumber} from ${po.supplierName}`,
        currentStaff.name,
        currentStaff.role
      );
    });

    const updated: PurchaseOrder = {
      ...po,
      status: "Fully Received",
      receivedAt: new Date().toISOString(),
    };
    db.savePurchaseOrder(updated, currentStaff.name, currentStaff.role);
    setFeedback(`Purchase Order ${po.poNumber} received. Stock added to warehouse ledger.`);
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const product = products.find((p) => p.id === selectedProductId);
    if (!supplier || !product) return;

    const totalCost = poQuantity * poUnitCost;
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: poQuantity,
          unitCost: poUnitCost,
          totalCost,
          receivedQuantity: 0,
        },
      ],
      totalAmount: totalCost,
      status: "Sent to Supplier",
      expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    db.savePurchaseOrder(newPo, currentStaff.name, currentStaff.role);
    setFeedback(`Purchase Order ${poNumber} created and sent to ${supplier.name}.`);
    setIsNewPoOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Supply Chain & Procurement</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Suppliers & Purchase Orders</h2>
        </div>
        {canManage && (
          <button
            onClick={() => setIsNewPoOpen(true)}
            className="rounded-full bg-purple px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-purple-dark shadow-sm"
          >
            + New Purchase Order
          </button>
        )}
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-purple/10 pb-2">
        <button
          onClick={() => setActiveTab("pos")}
          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase transition ${
            activeTab === "pos" ? "bg-purple text-white" : "text-ink/60 hover:bg-lilac"
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase transition ${
            activeTab === "suppliers" ? "bg-purple text-white" : "text-ink/60 hover:bg-lilac"
          }`}
        >
          Supplier Profiles ({suppliers.length})
        </button>
      </div>

      {activeTab === "pos" ? (
        <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[50rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                  <th className="px-4 py-3.5">PO Number</th>
                  <th className="px-4 py-3.5">Supplier</th>
                  <th className="px-4 py-3.5">Items Ordered</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Expected Delivery</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple/5 text-xs">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="transition hover:bg-canvas/30">
                    <td className="px-4 py-3.5 font-mono font-bold text-purple">{po.poNumber}</td>
                    <td className="px-4 py-3.5 font-semibold text-ink">{po.supplierName}</td>
                    <td className="px-4 py-3.5">
                      {po.items.map((i, idx) => (
                        <span key={idx} className="block text-ink/80">
                          {i.productName} × {i.quantity} units (₹{i.unitCost}/unit)
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-purple-dark text-sm">
                      ₹{po.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 text-ink/60">{po.expectedDelivery}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          po.status === "Fully Received" ? "bg-mint text-purple-dark" : "bg-sky text-purple-dark"
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {canManage && po.status !== "Fully Received" && (
                        <button
                          onClick={() => handleReceivePo(po)}
                          className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white uppercase hover:bg-emerald-700"
                        >
                          Receive & Add to Stock ✓
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {suppliers.map((sup) => (
            <div key={sup.id} className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <h3 className="font-display text-lg font-bold text-purple-dark">{sup.name}</h3>
                <span className="rounded bg-mint px-2 py-0.5 text-[8px] font-bold text-purple-dark uppercase">
                  {sup.status}
                </span>
              </div>
              <p className="text-ink/60">Contact Person: <strong>{sup.contactPerson}</strong></p>
              <p className="text-ink/60">Email: {sup.email} | Phone: {sup.phone}</p>
              <p className="text-ink/60">GSTIN: <span className="font-mono">{sup.gstin || "Pending"}</span></p>
              <p className="text-ink/60">Address: {sup.address}</p>
              <div className="pt-2 border-t flex justify-between items-center text-[11px]">
                <span>Terms: <strong>{sup.paymentTerms}</strong></span>
                <span className="text-purple font-semibold">Categories: {sup.suppliedCategories.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New PO Modal */}
      {isNewPoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsNewPoOpen(false)}>
          <form
            onSubmit={handleCreatePo}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display text-xl font-bold text-purple-dark">Create Purchase Order</h3>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Select Supplier</span>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                required
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>
                ))}
              </select>
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Product to Restock</span>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((prod) => prod.id === e.target.value);
                  if (p) setPoUnitCost(p.costPrice);
                }}
                required
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (Current: {p.stock} units)</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Order Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Unit Cost (₹)</span>
                <input
                  type="number"
                  min={1}
                  value={poUnitCost}
                  onChange={(e) => setPoUnitCost(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
                />
              </label>
            </div>

            <div className="rounded-xl bg-canvas p-3 text-xs flex justify-between font-bold">
              <span>Total PO Value:</span>
              <span className="text-purple-dark text-base">₹{(poQuantity * poUnitCost).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsNewPoOpen(false)}
                className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSupplierId || !selectedProductId}
                className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark disabled:opacity-40"
              >
                Issue Purchase Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
