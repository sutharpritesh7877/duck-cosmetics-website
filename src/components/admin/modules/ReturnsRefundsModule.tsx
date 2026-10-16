import { useState } from "react";
import { ReturnRequest } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function ReturnsRefundsModule() {
  const currentStaff = authService.getCurrentUser();
  const returns = db.getReturns();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [feedback, setFeedback] = useState("");

  const canApprove = authService.can("returns:approve", currentStaff);
  const canRefund = authService.can("returns:refund", currentStaff);

  const filtered = returns.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        r.requestNumber.toLowerCase().includes(term) ||
        r.orderNumber.toLowerCase().includes(term) ||
        r.customerName.toLowerCase().includes(term) ||
        r.reason.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleUpdateReturn = (
    nextStatus: ReturnRequest["status"],
    condition?: ReturnRequest["receivedCondition"],
    restock?: ReturnRequest["restockingDecision"],
    refundStatus?: ReturnRequest["refundStatus"]
  ) => {
    if (!selectedReturn) return;

    const updated: ReturnRequest = {
      ...selectedReturn,
      status: nextStatus,
      receivedCondition: condition || selectedReturn.receivedCondition,
      restockingDecision: restock || selectedReturn.restockingDecision,
      refundStatus: refundStatus || selectedReturn.refundStatus,
      processedBy: currentStaff.name,
      updatedAt: new Date().toISOString(),
    };

    // If restocking for resale, add back to inventory!
    if (restock === "Restock for Resale") {
      selectedReturn.items.forEach((item) => {
        db.adjustStock(
          item.productId,
          item.quantity,
          "Return Approved",
          `Restocked from inspected return ${selectedReturn.requestNumber}`,
          currentStaff.name,
          currentStaff.role
        );
      });
    }

    // If refund processed, record refund transaction in ledger!
    if (refundStatus === "Processed" && selectedReturn.refundStatus !== "Processed") {
      db.addTransaction(
        {
          transactionRef: `REF_${Date.now()}_${selectedReturn.requestNumber}`,
          orderId: selectedReturn.orderId,
          orderNumber: selectedReturn.orderNumber,
          customerName: selectedReturn.customerName,
          method: "UPI",
          type: "Refund",
          amount: selectedReturn.refundAmount,
          status: "Success",
          verifiedAt: new Date().toISOString(),
          notes: `Customer refund approved and paid out for return ${selectedReturn.requestNumber}`,
          recordedBy: currentStaff.name,
        },
        currentStaff.name,
        currentStaff.role
      );

      // Trigger notification
      db.addNotification({
        orderId: selectedReturn.orderId,
        orderNumber: selectedReturn.orderNumber,
        recipient: `${selectedReturn.customerEmail} / ${selectedReturn.customerPhone}`,
        channel: "WhatsApp",
        type: "Refund Processed",
        subject: `Refund of ₹${selectedReturn.refundAmount} Processed - Duck Cosmetics`,
        body: `Hi ${selectedReturn.customerName}, your refund of ₹${selectedReturn.refundAmount} for return request ${selectedReturn.requestNumber} has been processed back to your original payment method.`,
        status: "Sent",
      });
    }

    db.saveReturn(updated, currentStaff.name, currentStaff.role);
    setFeedback(`Return ${selectedReturn.requestNumber} updated to ${nextStatus}.`);
    setSelectedReturn(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Customer Returns & Warranty</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Returns & Refunds ({returns.length})</h2>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by request #, order #, reason, customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="All">All Return Statuses</option>
          {["Return Requested", "Under Review", "Approved", "Item Received", "Refund Processing", "Refunded", "Rejected"].map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Returns Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[55rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Request No</th>
                <th className="px-4 py-3.5">Order Ref</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Products</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Condition</th>
                <th className="px-4 py-3.5">Refund (INR)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((ret) => (
                <tr key={ret.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5 font-mono font-bold text-purple">{ret.requestNumber}</td>
                  <td className="px-4 py-3.5 font-semibold text-ink">{ret.orderNumber}</td>
                  <td className="px-4 py-3.5">
                    <strong className="block text-ink">{ret.customerName}</strong>
                    <small className="text-[10px] text-ink/40">{ret.customerPhone}</small>
                  </td>
                  <td className="px-4 py-3.5">
                    {ret.items.map((i, idx) => (
                      <span key={idx} className="block text-ink/75">
                        {i.productName} × {i.quantity}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3.5 text-coral font-medium">{ret.reason}</td>
                  <td className="px-4 py-3.5 text-ink/60">{ret.receivedCondition || "Awaiting Arrival"}</td>
                  <td className="px-4 py-3.5 font-bold text-purple-dark">₹{ret.refundAmount}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        ret.status === "Refunded" ? "bg-mint text-purple-dark" :
                        ret.status === "Approved" ? "bg-sky text-purple-dark" :
                        ret.status === "Rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ret.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReturn(ret)}
                      className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase hover:bg-purple hover:text-white transition"
                    >
                      Review & Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Resolution Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedReturn(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[9px] font-bold text-purple uppercase">Resolution Workflow</span>
                <h3 className="font-display text-xl font-bold">{selectedReturn.requestNumber} ({selectedReturn.orderNumber})</h3>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="rounded-full bg-canvas px-3 py-1 text-xs">✕</button>
            </div>

            <div className="rounded-xl bg-canvas p-3 text-xs space-y-1">
              <div><strong>Customer:</strong> {selectedReturn.customerName} ({selectedReturn.customerPhone})</div>
              <div><strong>Return Reason:</strong> {selectedReturn.reason}</div>
              {selectedReturn.customerComments && (
                <div className="text-ink/60 italic">"{selectedReturn.customerComments}"</div>
              )}
              <div className="pt-1"><strong>Refund Eligible:</strong> ₹{selectedReturn.refundAmount}</div>
            </div>

            {canApprove && (
              <div className="space-y-3 pt-2 text-xs">
                <span className="block font-bold text-purple uppercase text-[9px]">1. Inspection & Condition</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateReturn("Approved", "Pristine Unopened", "Restock for Resale")}
                    className="rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 font-bold text-emerald-800 text-left hover:bg-emerald-100"
                  >
                    ✓ Pristine / Restock for Resale
                  </button>
                  <button
                    onClick={() => handleUpdateReturn("Approved", "Damaged / Broken", "Quarantine / Write-off")}
                    className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 font-bold text-amber-800 text-left hover:bg-amber-100"
                  >
                    ⚠ Damaged / Write-off
                  </button>
                </div>

                <button
                  onClick={() => handleUpdateReturn("Rejected", undefined, undefined, "Rejected")}
                  className="w-full rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  ✕ Reject Return (Violates 7-Day / Hygiene Policy)
                </button>
              </div>
            )}

            {canRefund && selectedReturn.status !== "Refunded" && (
              <div className="pt-2 border-t text-xs space-y-2">
                <span className="block font-bold text-purple uppercase text-[9px]">2. Financial Payout</span>
                <button
                  onClick={() => handleUpdateReturn("Refunded", undefined, undefined, "Processed")}
                  className="w-full rounded-xl bg-purple py-3 text-xs font-bold text-white uppercase hover:bg-purple-dark"
                >
                  Confirm & Process Refund (₹{selectedReturn.refundAmount})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
