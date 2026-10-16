import { useState } from "react";
import { Order } from "../../../types";
import { db } from "../../../backend/db";
import { invoiceService } from "../../../backend/invoiceService";

export function InvoicesModule() {
  const orders = db.getOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [docType, setDocType] = useState<"invoice" | "packing" | "label">("invoice");

  const filteredOrders = orders.filter((o) => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(term)) ||
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleOpenDoc = (order: Order, type: "invoice" | "packing" | "label") => {
    setActiveOrder(order);
    setDocType(type);
  };

  const handlePrint = () => {
    if (!activeOrder) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const htmlContent =
        docType === "invoice" ? invoiceService.generateTaxInvoiceHtml(activeOrder) :
        docType === "packing" ? invoiceService.generatePackingSlipHtml(activeOrder) :
        invoiceService.generateShippingLabelHtml(activeOrder);
      printWindow.document.write(`<html><head><title>Print ${docType}</title></head><body>${htmlContent}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Billing & Compliance</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">GST Invoices & Documents ({orders.length})</h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by GST invoice number, order #, or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[55rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Invoice Number</th>
                <th className="px-4 py-3.5">Order Ref</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Billed Customer</th>
                <th className="px-4 py-3.5">Tax (GST)</th>
                <th className="px-4 py-3.5">Invoice Total</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5 text-right">Generate & Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5 font-mono font-bold text-purple text-sm">
                    {order.invoiceNumber || `DUCK/INV-${order.orderNumber}`}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-ink">{order.orderNumber}</td>
                  <td className="px-4 py-3.5 text-ink/50 text-[11px] whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5">
                    <strong className="block text-ink">{order.customerName}</strong>
                    <span className="text-[10px] text-ink/40">{order.shippingAddress.state}</span>
                  </td>
                  <td className="px-4 py-3.5 text-ink/65 font-medium">₹{order.taxTotal}</td>
                  <td className="px-4 py-3.5 font-bold text-purple-dark text-sm">
                    ₹{order.grandTotal.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                        order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => handleOpenDoc(order, "invoice")}
                      className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase hover:bg-purple hover:text-white transition"
                    >
                      Tax Invoice
                    </button>
                    <button
                      onClick={() => handleOpenDoc(order, "packing")}
                      className="rounded-full bg-canvas px-3 py-1 text-[10px] font-bold text-ink/60 uppercase hover:bg-lilac hover:text-purple transition"
                    >
                      Packing Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document View / Print Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setActiveOrder(null)}>
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple uppercase">{docType} Document</span>
                <span className="font-mono text-sm font-semibold text-ink">({activeOrder.orderNumber})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark shadow-sm"
                >
                  Print / Save PDF
                </button>
                <button onClick={() => setActiveOrder(null)} className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase">
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4" dangerouslySetInnerHTML={{
              __html:
                docType === "invoice" ? invoiceService.generateTaxInvoiceHtml(activeOrder) :
                docType === "packing" ? invoiceService.generatePackingSlipHtml(activeOrder) :
                invoiceService.generateShippingLabelHtml(activeOrder),
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
