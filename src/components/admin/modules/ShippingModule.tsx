import { useState } from "react";
import { Shipment, ShippingProvider } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { invoiceService } from "../../../backend/invoiceService";

export function ShippingModule() {
  const currentStaff = authService.getCurrentUser();
  const shipments = db.getShipments();

  const [searchTerm, setSearchTerm] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [printLabelHtml, setPrintLabelHtml] = useState<string | null>(null);

  const canDispatch = authService.can("shipping:dispatch", currentStaff);

  const filtered = shipments.filter((s) => {
    if (carrierFilter !== "All" && s.carrier !== carrierFilter) return false;
    if (statusFilter !== "All" && s.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        s.shipmentNumber.toLowerCase().includes(term) ||
        s.orderNumber.toLowerCase().includes(term) ||
        s.customerName.toLowerCase().includes(term) ||
        s.trackingNumber.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleUpdateStatus = (shipment: Shipment, nextStatus: Shipment["status"]) => {
    const updated: Shipment = {
      ...shipment,
      status: nextStatus,
      deliveredAt: nextStatus === "Delivered" ? new Date().toISOString() : shipment.deliveredAt,
      failedAttempts: nextStatus === "Delivery Failed" ? shipment.failedAttempts + 1 : shipment.failedAttempts,
    };

    db.saveShipment(updated, currentStaff.name, currentStaff.role);
    setToastMsg(`Shipment ${shipment.shipmentNumber} marked as ${nextStatus}.`);

    // Also sync with parent order if applicable
    const parentOrder = db.getOrderById(shipment.orderId);
    if (parentOrder) {
      if (nextStatus === "Delivered") {
        parentOrder.orderStatus = "Delivered";
        parentOrder.shippingStatus = "Delivered";
        parentOrder.deliveredAt = new Date().toISOString();
        db.saveOrder(parentOrder, currentStaff.name, currentStaff.role);
      } else if (nextStatus === "Out for Delivery") {
        parentOrder.orderStatus = "Out for Delivery";
        parentOrder.shippingStatus = "Out for Delivery";
        db.saveOrder(parentOrder, currentStaff.name, currentStaff.role);
      }
    }
  };

  const handlePrintLabel = (shipment: Shipment) => {
    const order = db.getOrderById(shipment.orderId);
    if (order) {
      setPrintLabelHtml(invoiceService.generateShippingLabelHtml(order));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Logistics & Dispatch</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Shipping & Delivery ({shipments.length})</h2>
        </div>
      </div>

      {toastMsg && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {toastMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">In Transit Shipments</p>
          <p className="mt-2 font-display text-3xl font-bold text-sky-700">
            {shipments.filter((s) => s.status === "In Transit" || s.status === "Manifested").length}
          </p>
          <p className="mt-1 text-xs text-ink/50">Carriers: Delhivery, BlueDart, DTDC</p>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Out for Delivery</p>
          <p className="mt-2 font-display text-3xl font-bold text-purple-dark">
            {shipments.filter((s) => s.status === "Out for Delivery").length}
          </p>
          <p className="mt-1 text-xs text-ink/50">Expected delivery today</p>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Delivered This Month</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-700">
            {shipments.filter((s) => s.status === "Delivered").length}
          </p>
          <p className="mt-1 text-xs text-ink/50">Successful first-attempt fulfillment</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-red-800 uppercase">Exceptions / RTO</p>
          <p className="mt-2 font-display text-3xl font-bold text-red-600">
            {shipments.filter((s) => s.status === "Delivery Failed" || s.status.includes("RTO")).length}
          </p>
          <p className="mt-1 text-xs text-ink/50">Return to Origin & failed attempts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by shipment #, order #, AWB or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Carriers</option>
            {["Delhivery", "BlueDart", "Shiprocket", "DTDC", "India Post"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Statuses</option>
            {["Manifested", "In Transit", "Out for Delivery", "Delivered", "Delivery Failed", "RTO Initiated"].map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[55rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Shipment Ref</th>
                <th className="px-4 py-3.5">Order No</th>
                <th className="px-4 py-3.5">Recipient</th>
                <th className="px-4 py-3.5">Carrier</th>
                <th className="px-4 py-3.5">AWB / Tracking</th>
                <th className="px-4 py-3.5">Dispatched</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Fulfillment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((s) => (
                <tr key={s.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5 font-mono font-bold text-purple">{s.shipmentNumber}</td>
                  <td className="px-4 py-3.5 font-semibold text-ink">{s.orderNumber}</td>
                  <td className="px-4 py-3.5">
                    <strong className="block text-ink">{s.customerName}</strong>
                    <span className="text-[10px] text-ink/45">{s.shippingAddress.city}, {s.shippingAddress.pinCode}</span>
                  </td>
                  <td className="px-4 py-3.5 font-medium">{s.carrier}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[11px] block">{s.trackingNumber}</span>
                    <a
                      href={s.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] font-bold text-purple underline"
                    >
                      Track live ↗
                    </a>
                  </td>
                  <td className="px-4 py-3.5 text-ink/50">{new Date(s.dispatchedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        s.status === "Delivered" ? "bg-mint text-purple-dark" :
                        s.status === "In Transit" ? "bg-sky text-purple-dark" :
                        s.status === "Out for Delivery" ? "bg-teal-100 text-teal-800" :
                        s.status === "Delivery Failed" ? "bg-red-100 text-red-700" :
                        "bg-purple-100 text-purple-dark"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => handlePrintLabel(s)}
                      className="rounded-full border border-purple/20 px-2.5 py-1 text-[9px] font-bold text-purple uppercase hover:bg-lilac"
                    >
                      Print Label
                    </button>
                    {canDispatch && s.status !== "Delivered" && (
                      <button
                        onClick={() => handleUpdateStatus(s, "Delivered")}
                        className="rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-bold text-white uppercase hover:bg-emerald-700"
                      >
                        Delivered ✓
                      </button>
                    )}
                    {canDispatch && s.status === "In Transit" && (
                      <button
                        onClick={() => handleUpdateStatus(s, "Out for Delivery")}
                        className="rounded-full bg-sky px-2.5 py-1 text-[9px] font-bold text-purple-dark uppercase"
                      >
                        Out for Delivery
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Label Modal */}
      {printLabelHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPrintLabelHtml(null)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-lg font-bold">Print Shipping Label</h3>
              <button onClick={() => setPrintLabelHtml(null)} className="rounded-full bg-canvas px-3 py-1 text-xs">Close</button>
            </div>
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: printLabelHtml }} />
            <button
              onClick={() => {
                const w = window.open("", "_blank");
                if (w) {
                  w.document.write(`<html><head><title>Print Label</title></head><body>${printLabelHtml}</body></html>`);
                  w.document.close();
                  w.focus();
                  w.print();
                }
              }}
              className="mt-4 w-full rounded-full bg-purple py-3 text-xs font-bold text-white uppercase hover:bg-purple-dark"
            >
              Print Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
