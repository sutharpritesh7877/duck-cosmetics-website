import { useState } from "react";
import { PaymentTransaction } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";

export function PaymentsModule() {
  const currentStaff = authService.getCurrentUser();
  const transactions = db.getTransactions();
  const orders = db.getOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [codReconciliationOrder, setCodReconciliationOrder] = useState<string>("");
  const [codAmount, setCodAmount] = useState<number>(0);
  const [codRef, setCodRef] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  const canManage = authService.can("payments:manage", currentStaff);

  const pendingCodOrders = orders.filter(
    (o) => o.paymentMethod === "Cash on Delivery" && o.paymentStatus !== "Paid" && o.orderStatus !== "Cancelled"
  );

  const totalCollected = transactions
    .filter((t) => t.status === "Success" && (t.type === "Payment" || t.type === "COD Collection"))
    .reduce((s, t) => s + t.amount, 0);

  const totalRefunded = transactions
    .filter((t) => t.status === "Success" && t.type === "Refund")
    .reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter((t) => {
    if (methodFilter !== "All" && t.method !== methodFilter) return false;
    if (typeFilter !== "All" && t.type !== typeFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        t.transactionRef.toLowerCase().includes(term) ||
        t.orderNumber.toLowerCase().includes(term) ||
        t.customerName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleReconcileCod = (e: React.FormEvent) => {
    e.preventDefault();
    const order = orders.find((o) => o.id === codReconciliationOrder || o.orderNumber === codReconciliationOrder);
    if (!order) return;

    order.paymentStatus = "Paid";
    order.amountPaid = order.grandTotal;
    order.amountDue = 0;
    order.updatedAt = new Date().toISOString();

    db.saveOrder(order, currentStaff.name, currentStaff.role);

    db.addTransaction(
      {
        transactionRef: codRef || `COD_REC_${Date.now()}_${order.orderNumber}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        method: "Cash on Delivery",
        type: "COD Collection",
        amount: codAmount || order.grandTotal,
        status: "Success",
        verifiedAt: new Date().toISOString(),
        notes: `COD cash collected & reconciled from courier deposit slip.`,
        recordedBy: currentStaff.name,
      },
      currentStaff.name,
      currentStaff.role
    );

    setFeedback(`COD order ${order.orderNumber} successfully reconciled as Paid.`);
    setCodReconciliationOrder("");
    setCodAmount(0);
    setCodRef("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Financial Ledger</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Payments & Transactions ({transactions.length})</h2>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Total Collected Receipts</p>
          <p className="mt-2 font-display text-3xl font-bold text-emerald-700">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink/50">Includes UPI, 3D Cards, and settled COD</p>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Total Approved Refunds Paid</p>
          <p className="mt-2 font-display text-3xl font-bold text-rose-600">
            ₹{totalRefunded.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-ink/50">Returned through payment gateway</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">Unsettled COD Orders</p>
          <p className="mt-2 font-display text-3xl font-bold text-amber-700">
            {pendingCodOrders.length} orders
          </p>
          <p className="mt-1 text-xs text-ink/50">₹{pendingCodOrders.reduce((s, o) => s + o.amountDue, 0).toLocaleString("en-IN")} pending collection</p>
        </div>
      </div>

      {/* COD Reconciliation Bar (If any pending) */}
      {pendingCodOrders.length > 0 && canManage && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold text-amber-900">Record Courier COD Cash Collection</h3>
          <p className="mt-1 text-xs text-amber-800/80">
            For cash collected upon delivery, record carrier remittance and reconcile the order as Paid.
          </p>

          <form onSubmit={handleReconcileCod} className="mt-3 flex flex-wrap gap-2 text-xs">
            <select
              value={codReconciliationOrder}
              onChange={(e) => {
                const ord = orders.find((o) => o.id === e.target.value);
                setCodReconciliationOrder(e.target.value);
                if (ord) setCodAmount(ord.amountDue);
              }}
              required
              className="rounded-xl border border-amber-300 bg-white p-2.5 outline-none font-semibold"
            >
              <option value="">Select uncollected COD order...</option>
              {pendingCodOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} – {o.customerName} (₹{o.amountDue})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount Received (₹)"
              value={codAmount || ""}
              onChange={(e) => setCodAmount(Number(e.target.value))}
              required
              className="rounded-xl border border-amber-300 bg-white p-2.5 outline-none"
            />

            <input
              type="text"
              placeholder="Carrier Deposit Slip Ref (e.g. DEL-COD-998)"
              value={codRef}
              onChange={(e) => setCodRef(e.target.value)}
              className="rounded-xl border border-amber-300 bg-white p-2.5 outline-none font-mono"
            />

            <button
              type="submit"
              disabled={!codReconciliationOrder}
              className="rounded-xl bg-amber-800 px-5 py-2.5 font-bold text-white uppercase hover:bg-amber-900 disabled:opacity-40"
            >
              Reconcile as Paid
            </button>
          </form>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search by transaction reference, order #, customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[16rem] flex-1 rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
        />

        <div className="flex flex-wrap gap-2 text-xs">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="NetBanking">NetBanking</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-purple/15 bg-canvas px-3 py-2 font-semibold outline-none"
          >
            <option value="All">All Transaction Types</option>
            <option value="Payment">Payment</option>
            <option value="COD Collection">COD Collection</option>
            <option value="Refund">Refund</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[55rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5">Transaction Ref</th>
                <th className="px-4 py-3.5">Order Ref</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Amount (INR)</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Recorded By</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-canvas/30">
                  <td className="px-4 py-3.5 font-mono font-bold text-purple">{t.transactionRef}</td>
                  <td className="px-4 py-3.5 font-semibold text-ink">{t.orderNumber}</td>
                  <td className="px-4 py-3.5 text-ink/80">{t.customerName}</td>
                  <td className="px-4 py-3.5 font-medium">{t.method}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                        t.type === "Refund" ? "bg-rose-100 text-rose-800" :
                        t.type === "COD Collection" ? "bg-amber-100 text-amber-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-purple-dark text-sm">
                    {t.type === "Refund" ? `-₹${t.amount}` : `₹${t.amount.toLocaleString("en-IN")}`}
                  </td>
                  <td className="px-4 py-3.5 text-ink/50 text-[11px] whitespace-nowrap">
                    {new Date(t.verifiedAt).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 text-ink/50">{t.recordedBy}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        t.status === "Success" ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
