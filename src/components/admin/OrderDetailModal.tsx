import { useState } from "react";
import { Order, OrderStatus, ShippingProvider } from "../../types";
import { db } from "../../backend/db";
import { orderService } from "../../backend/orderService";
import { authService } from "../../backend/authService";
import { invoiceService } from "../../backend/invoiceService";

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export function OrderDetailModal({ orderId, onClose, onOrderUpdated }: OrderDetailModalProps) {
  const currentStaff = authService.getCurrentUser();
  const order = db.getOrderById(orderId);
  const staffList = db.getStaff();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">(order?.orderStatus || "");
  const [transitionNote, setTransitionNote] = useState("");
  const [transitionReason, setTransitionReason] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(order?.assignedStaffId || "");
  const [staffTaskNote, setStaffTaskNote] = useState(order?.taskStatus || "");
  const [carrier, setCarrier] = useState<ShippingProvider>(order?.shippingProvider || "Delhivery");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(order?.trackingUrl || "");
  const [internalNoteText, setInternalNoteText] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [printDoc, setPrintDoc] = useState<"invoice" | "packing" | "label" | null>(null);

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <p className="font-semibold text-red-600">Order not found.</p>
          <button onClick={onClose} className="mt-4 rounded-xl bg-purple px-4 py-2 text-xs font-bold text-white uppercase">Close</button>
        </div>
      </div>
    );
  }

  const showCustomerContact = authService.canViewCustomerSensitive(currentStaff);
  const canUpdateOrder = authService.can("orders:update", currentStaff);
  const canAssign = authService.can("orders:assign", currentStaff);
  const canCancel = authService.can("orders:cancel", currentStaff);

  const handleStatusChange = () => {
    if (!selectedStatus || selectedStatus === order.orderStatus) return;
    setFeedbackError("");
    setFeedbackMsg("");

    const res = orderService.updateOrderStatus(
      order.id,
      selectedStatus as OrderStatus,
      currentStaff,
      transitionNote || undefined,
      transitionReason || undefined
    );

    if (res.success) {
      setFeedbackMsg(`Order status successfully updated to ${selectedStatus}.`);
      setTransitionNote("");
      setTransitionReason("");
      onOrderUpdated?.();
    } else {
      setFeedbackError(res.error || "Failed to update status.");
    }
  };

  const handleAssignStaff = () => {
    const targetStaff = staffList.find((s) => s.id === selectedStaffId);
    if (!targetStaff) return;
    orderService.assignStaff(order.id, targetStaff, currentStaff, staffTaskNote);
    setFeedbackMsg(`Order assigned to ${targetStaff.name}.`);
    onOrderUpdated?.();
  };

  const handleUpdateShipping = () => {
    if (!trackingNumber) {
      setFeedbackError("Please provide a tracking number.");
      return;
    }
    const finalUrl = trackingUrl || `https://www.trackcourier.in/track/${trackingNumber}`;
    orderService.updateShippingDetails(order.id, carrier, trackingNumber, finalUrl, currentStaff);
    setFeedbackMsg(`Carrier ${carrier} tracking ${trackingNumber} updated.`);
    onOrderUpdated?.();
  };

  const handleAddNote = () => {
    if (!internalNoteText.trim()) return;
    orderService.addInternalNote(order.id, internalNoteText.trim(), currentStaff);
    setInternalNoteText("");
    setFeedbackMsg("Internal staff note recorded.");
    onOrderUpdated?.();
  };

  const handleResendNotification = () => {
    db.addNotification({
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipient: `${order.customerEmail} / ${order.customerPhone}`,
      channel: "WhatsApp",
      type: "Order Shipped",
      subject: `Update regarding order ${order.orderNumber}`,
      body: `Hi ${order.customerName}, your Duck Cosmetics order ${order.orderNumber} is currently ${order.orderStatus}. Tracking: ${order.trackingNumber || "Assigned shortly"}.`,
      status: "Sent",
    });
    setFeedbackMsg("Notification resent to customer via WhatsApp/Email.");
  };

  const handlePrint = (type: "invoice" | "packing" | "label") => {
    setPrintDoc(type);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-purple-dark/60 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between border-b border-purple/10 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-lilac px-3 py-1 font-mono text-xs font-bold text-purple">{order.orderNumber}</span>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                order.orderStatus === "Delivered" ? "bg-mint text-purple-dark" :
                order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                order.orderStatus === "Shipped" ? "bg-sky text-purple-dark" :
                "bg-amber-100 text-amber-800"
              }`}>
                {order.orderStatus}
              </span>
              <span className="text-xs text-ink/40">Placed on {new Date(order.createdAt).toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-1 text-xs text-ink/50">Invoice: <strong>{order.invoiceNumber || "Pending"}</strong> | Place of Supply: {order.shippingAddress.state}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
            <button onClick={() => handlePrint("invoice")} className="rounded-full border border-purple/20 bg-lilac/30 px-3 py-2 text-[10px] font-bold tracking-wider text-purple uppercase transition hover:bg-lilac">
              Tax Invoice
            </button>
            <button onClick={() => handlePrint("packing")} className="rounded-full border border-purple/20 bg-lilac/30 px-3 py-2 text-[10px] font-bold tracking-wider text-purple uppercase transition hover:bg-lilac">
              Packing Slip
            </button>
            <button onClick={() => handlePrint("label")} className="rounded-full border border-purple/20 bg-lilac/30 px-3 py-2 text-[10px] font-bold tracking-wider text-purple uppercase transition hover:bg-lilac">
              Shipping Label
            </button>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-ink/60 hover:bg-lilac hover:text-purple" aria-label="Close modal">
              ✕
            </button>
          </div>
        </header>

        {feedbackMsg && (
          <div className="mx-6 mt-4 rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
            ✓ {feedbackMsg}
          </div>
        )}
        {feedbackError && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
            ⚠ {feedbackError}
          </div>
        )}

        <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left Column: Items, Customer, Financials */}
          <div className="space-y-6">
            {/* Order Items Table */}
            <section className="rounded-2xl border border-purple/10 bg-canvas/40 p-5">
              <h3 className="font-display text-lg font-semibold text-purple-dark">Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</h3>
              <div className="mt-4 divide-y divide-purple/10">
                {order.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center gap-4 py-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover bg-white p-1 border border-purple/10" />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-ink">{item.name}</h4>
                      <p className="text-[10px] text-ink/45">SKU: <span className="font-mono">{item.sku}</span> · GST: {item.gstRate}%</p>
                      <p className="mt-1 text-xs text-ink/60">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <strong className="block text-sm font-semibold">₹{item.total.toLocaleString("en-IN")}</strong>
                      <small className="text-[9px] text-ink/40">Tax: ₹{item.taxAmount}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Financial Summary */}
            <section className="rounded-2xl border border-purple/10 bg-white p-5">
              <h3 className="font-display text-lg font-semibold text-purple-dark">Financial & Tax Breakdown</h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-ink/60"><span>Items Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-coral font-medium"><span>Discount ({order.couponCode || "Coupon"})</span><span>-₹{order.discountTotal.toLocaleString("en-IN")}</span></div>
                )}
                <div className="flex justify-between text-ink/60"><span>Shipping Fee</span><span>{order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}</span></div>
                {order.cgst > 0 && <div className="flex justify-between text-ink/45"><span>CGST</span><span>₹{order.cgst}</span></div>}
                {order.sgst > 0 && <div className="flex justify-between text-ink/45"><span>SGST</span><span>₹{order.sgst}</span></div>}
                {order.igst > 0 && <div className="flex justify-between text-ink/45"><span>IGST</span><span>₹{order.igst}</span></div>}
                <div className="flex justify-between border-t border-purple/10 pt-2 font-display text-base font-bold text-purple-dark">
                  <span>Grand Total</span>
                  <span>₹{order.grandTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-2 flex justify-between rounded-lg bg-canvas p-2 font-medium">
                  <span className="text-emerald-700">Amount Paid ({order.paymentMethod})</span>
                  <strong className="text-emerald-700">₹{order.amountPaid.toLocaleString("en-IN")}</strong>
                </div>
                {order.amountDue > 0 && (
                  <div className="flex justify-between rounded-lg bg-amber-50 p-2 font-bold text-amber-800">
                    <span>Amount Due (Cash on Delivery)</span>
                    <span>₹{order.amountDue.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Customer Details */}
            <section className="rounded-2xl border border-purple/10 bg-canvas/30 p-5">
              <h3 className="font-display text-lg font-semibold text-purple-dark">Customer Information</h3>
              <div className="mt-3 grid gap-4 text-xs sm:grid-cols-2">
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-purple uppercase">Recipient</span>
                  <strong className="mt-1 block text-sm">{order.customerName}</strong>
                  <p className="mt-1 text-ink/60">{showCustomerContact ? order.customerPhone : `${order.customerPhone.slice(0, 3)}•••••${order.customerPhone.slice(-2)}`}</p>
                  <p className="text-ink/60">{showCustomerContact ? order.customerEmail : `${order.customerEmail.slice(0, 3)}••••@•••.com`}</p>
                  {!showCustomerContact && (
                    <span className="mt-2 inline-block rounded bg-lilac/70 px-2 py-0.5 text-[8px] font-bold text-purple uppercase">Phone & Email Masked</span>
                  )}
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-wider text-purple uppercase">Shipping Address</span>
                  <p className="mt-1 leading-relaxed text-ink/70">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} – <strong>{order.shippingAddress.pinCode}</strong>
                  </p>
                </div>
              </div>
              {order.customerNotes && (
                <div className="mt-3 rounded-xl bg-blush/60 p-3 text-xs text-ink/75">
                  <strong className="block text-[9px] font-bold text-coral uppercase">Customer Note:</strong>
                  {order.customerNotes}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Workflow, Assignment, Shipping, Timeline */}
          <div className="space-y-6">
            {/* Workflow Progression Controls */}
            <section className="rounded-2xl border border-purple/10 bg-white p-5">
              <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Fulfillment Lifecycle</span>
              <h3 className="mt-1 font-display text-lg font-semibold">Change Order Status</h3>

              <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold">
                  Update Status:
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    className="mt-1 w-full rounded-xl border border-purple/20 bg-white p-2.5 text-xs font-semibold outline-none"
                    disabled={!canUpdateOrder}
                  >
                    {[
                      "New",
                      "Awaiting Confirmation",
                      "Confirmed",
                      "Processing",
                      "Packing",
                      "Ready for Dispatch",
                      "Shipped",
                      "Out for Delivery",
                      "Delivered",
                      "Cancelled",
                      "Return Requested",
                      "Refund Pending",
                      "Refunded",
                    ].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </label>

                <input
                  type="text"
                  placeholder="Optional note / milestone detail"
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  className="w-full rounded-xl border border-purple/15 p-2 text-xs outline-none"
                />

                {selectedStatus === "Cancelled" && (
                  <input
                    type="text"
                    required
                    placeholder="Mandatory cancellation reason"
                    value={transitionReason}
                    onChange={(e) => setTransitionReason(e.target.value)}
                    className="w-full rounded-xl border border-red-300 bg-red-50 p-2 text-xs text-red-900 outline-none"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleStatusChange}
                    disabled={!canUpdateOrder || selectedStatus === order.orderStatus}
                    className="flex-1 rounded-xl bg-purple py-2.5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark disabled:opacity-40"
                  >
                    Save Status
                  </button>
                  {canCancel && order.orderStatus !== "Cancelled" && (
                    <button
                      onClick={() => {
                        setSelectedStatus("Cancelled");
                        setTransitionReason("Cancelled by Staff Operations");
                      }}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 uppercase"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Staff Assignment */}
            <section className="rounded-2xl border border-purple/10 bg-canvas/30 p-5">
              <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Operations Assignment</span>
              <h3 className="mt-1 font-display text-lg font-semibold">Assign Staff Member</h3>

              <div className="mt-3 space-y-2">
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  disabled={!canAssign}
                  className="w-full rounded-xl border border-purple/20 bg-white p-2.5 text-xs font-semibold outline-none"
                >
                  <option value="">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Task instructions (e.g. check gift wrap, verify COD)"
                  value={staffTaskNote}
                  onChange={(e) => setStaffTaskNote(e.target.value)}
                  disabled={!canAssign}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2 text-xs outline-none"
                />

                <button
                  onClick={handleAssignStaff}
                  disabled={!canAssign || !selectedStaffId}
                  className="w-full rounded-xl border border-purple/20 bg-white py-2 text-xs font-bold tracking-wider text-purple uppercase transition hover:bg-lilac disabled:opacity-40"
                >
                  Update Assignment
                </button>
              </div>
            </section>

            {/* Shipping & Tracking */}
            <section className="rounded-2xl border border-purple/10 bg-white p-5">
              <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Logistics & Tracking</span>
              <h3 className="mt-1 font-display text-lg font-semibold">Carrier Details</h3>

              <div className="mt-3 space-y-2 text-xs">
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value as ShippingProvider)}
                  className="w-full rounded-xl border border-purple/15 bg-white p-2 text-xs font-semibold outline-none"
                >
                  <option>Delhivery</option>
                  <option>BlueDart</option>
                  <option>Shiprocket</option>
                  <option>DTDC</option>
                  <option>India Post</option>
                  <option>Local Express / In-House</option>
                </select>

                <input
                  type="text"
                  placeholder="Tracking Number (AWB)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full rounded-xl border border-purple/15 p-2 text-xs outline-none font-mono"
                />

                <input
                  type="url"
                  placeholder="Tracking URL (optional)"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full rounded-xl border border-purple/15 p-2 text-xs outline-none"
                />

                <button
                  onClick={handleUpdateShipping}
                  className="w-full rounded-xl bg-purple/10 py-2 text-xs font-bold tracking-wider text-purple uppercase transition hover:bg-purple hover:text-white"
                >
                  Save Tracking Details
                </button>
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-[10px] font-bold text-purple underline mt-1"
                  >
                    Open Live Tracking Link ↗
                  </a>
                )}
              </div>
            </section>

            {/* Internal Notes & Communications */}
            <section className="rounded-2xl border border-purple/10 bg-canvas/30 p-5">
              <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Internal Staff Notes</span>
              <div className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-3 font-mono text-[11px] text-ink/75 border border-purple/10">
                {order.internalStaffNotes || "No internal notes recorded yet."}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Add private note (visible to staff only)..."
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  className="flex-1 rounded-xl border border-purple/15 bg-white p-2 text-xs outline-none"
                />
                <button onClick={handleAddNote} className="rounded-xl bg-purple px-4 py-2 text-xs font-bold text-white uppercase">
                  Add
                </button>
              </div>

              <button
                onClick={handleResendNotification}
                className="mt-3 w-full rounded-xl border border-purple/20 bg-white py-2 text-[10px] font-bold tracking-wider text-purple uppercase transition hover:bg-lilac"
              >
                Resend Status Notification to Customer
              </button>
            </section>

            {/* Activity Timeline */}
            <section className="rounded-2xl border border-purple/10 bg-white p-5">
              <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Audit Trail</span>
              <h3 className="mt-1 font-display text-lg font-semibold">Order Activity Timeline</h3>

              <div className="mt-4 space-y-4 border-l-2 border-purple/20 pl-4">
                {order.timeline.map((event) => (
                  <div key={event.id} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-purple" />
                    <div className="flex items-center justify-between">
                      <strong className="text-purple-dark">{event.status}</strong>
                      <span className="text-[10px] text-ink/40">{new Date(event.timestamp).toLocaleDateString("en-IN")} {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-0.5 text-ink/70">{event.note}</p>
                    <small className="block text-[9px] text-ink/40">By {event.actor} ({event.actorRole})</small>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Printable Document Modal Preview */}
        {printDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setPrintDoc(null)}>
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-display text-xl font-bold capitalize">{printDoc} Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const printWindow = window.open("", "_blank");
                      if (printWindow) {
                        const content =
                          printDoc === "invoice" ? invoiceService.generateTaxInvoiceHtml(order) :
                          printDoc === "packing" ? invoiceService.generatePackingSlipHtml(order) :
                          invoiceService.generateShippingLabelHtml(order);
                        printWindow.document.write(`<html><head><title>Print ${printDoc}</title></head><body>${content}</body></html>`);
                        printWindow.document.close();
                        printWindow.focus();
                        printWindow.print();
                      }
                    }}
                    className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase"
                  >
                    Print Document
                  </button>
                  <button onClick={() => setPrintDoc(null)} className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase">Close</button>
                </div>
              </div>
              <div className="mt-4" dangerouslySetInnerHTML={{
                __html:
                  printDoc === "invoice" ? invoiceService.generateTaxInvoiceHtml(order) :
                  printDoc === "packing" ? invoiceService.generatePackingSlipHtml(order) :
                  invoiceService.generateShippingLabelHtml(order),
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
