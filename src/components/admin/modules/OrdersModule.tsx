import { useState, useMemo, useEffect } from "react";
import { Order, OrderStatus, PaymentStatus } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { orderService } from "../../../backend/orderService";
import { analyticsService } from "../../../backend/analyticsService";
import { OrderDetailModal } from "../OrderDetailModal";
import { isSupabaseConfigured, getSupabaseConfigStatus } from "../../../lib/supabaseClient";
import { fetchAllOrdersFromSupabase } from "../../../backend/supabaseService";

export function OrdersModule() {
  const currentStaff = authService.getCurrentUser();
  const [ordersList, setOrdersList] = useState<Order[]>(db.getOrders());
  const [supabaseConnected] = useState(isSupabaseConfigured());
  const staffList = db.getStaff();

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchAllOrdersFromSupabase().then((supOrders) => {
        if (supOrders && supOrders.length > 0) {
          setOrdersList(supOrders);
        }
      });
    }

    const unsub = db.subscribe(() => {
      if (!isSupabaseConfigured()) {
        setOrdersList(db.getOrders());
      }
    });

    return () => unsub();
  }, []);

  const allOrders = ordersList;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("All");
  const [assignedStaffFilter, setAssignedStaffFilter] = useState<string>("All");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [bulkActionTarget, setBulkActionTarget] = useState<string>("");
  const [actionMessage, setActionMessage] = useState("");

  const showCustomerContact = authService.canViewCustomerSensitive(currentStaff);
  const canUpdate = authService.can("orders:update", currentStaff);

  // Statistics counters
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      total: allOrders.length,
      new: 0,
      awaitingConfirmation: 0,
      confirmed: 0,
      packing: 0,
      readyForDispatch: 0,
      shipped: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
      returnRequested: 0,
      refundPending: 0,
      failedPayments: 0,
    };

    allOrders.forEach((o) => {
      if (o.orderStatus === "New") counts.new++;
      if (o.orderStatus === "Awaiting Confirmation") counts.awaitingConfirmation++;
      if (o.orderStatus === "Confirmed") counts.confirmed++;
      if (o.orderStatus === "Packing") counts.packing++;
      if (o.orderStatus === "Ready for Dispatch") counts.readyForDispatch++;
      if (o.orderStatus === "Shipped") counts.shipped++;
      if (o.orderStatus === "Out for Delivery") counts.outForDelivery++;
      if (o.orderStatus === "Delivered") counts.delivered++;
      if (o.orderStatus === "Cancelled") counts.cancelled++;
      if (o.orderStatus === "Return Requested") counts.returnRequested++;
      if (o.orderStatus === "Refund Pending") counts.refundPending++;
      if (o.paymentStatus === "Failed") counts.failedPayments++;
    });

    return counts;
  }, [allOrders]);

  // Filtering
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      if (statusFilter !== "All" && order.orderStatus !== statusFilter) return false;
      if (paymentStatusFilter !== "All" && order.paymentStatus !== paymentStatusFilter) return false;
      if (paymentMethodFilter !== "All" && order.paymentMethod !== paymentMethodFilter) return false;
      if (assignedStaffFilter !== "All" && order.assignedStaffId !== assignedStaffFilter) return false;

      if (dateRangeFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        if (dateRangeFilter === "today" && orderDate.toDateString() !== now.toDateString()) return false;
        if (dateRangeFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekAgo) return false;
        }
        if (dateRangeFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < monthAgo) return false;
        }
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(term);
        const matchesCustomer = order.customerName.toLowerCase().includes(term);
        const matchesPhone = order.customerPhone.includes(term);
        const matchesCity = order.shippingAddress.city.toLowerCase().includes(term);
        const matchesTracking = order.trackingNumber?.toLowerCase().includes(term);
        return matchesNumber || matchesCustomer || matchesPhone || matchesCity || matchesTracking;
      }

      return true;
    });
  }, [allOrders, statusFilter, paymentStatusFilter, paymentMethodFilter, assignedStaffFilter, dateRangeFilter, searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkAction = () => {
    if (!bulkActionTarget || selectedOrderIds.length === 0) return;
    let count = 0;

    selectedOrderIds.forEach((id) => {
      const res = orderService.updateOrderStatus(
        id,
        bulkActionTarget as OrderStatus,
        currentStaff,
        `Bulk operation executed by ${currentStaff.name}`
      );
      if (res.success) count++;
    });

    setActionMessage(`Bulk updated ${count} of ${selectedOrderIds.length} selected orders to ${bulkActionTarget}.`);
    setSelectedOrderIds([]);
    setBulkActionTarget("");
  };

  const statPills: { label: string; count: number; filterKey: string; color: string }[] = [
    { label: "Total Orders", count: stats.total, filterKey: "All", color: "bg-purple text-white" },
    { label: "New", count: stats.new, filterKey: "New", color: "bg-blue-100 text-blue-800" },
    { label: "Awaiting Conf.", count: stats.awaitingConfirmation, filterKey: "Awaiting Confirmation", color: "bg-amber-100 text-amber-800" },
    { label: "Confirmed", count: stats.confirmed, filterKey: "Confirmed", color: "bg-indigo-100 text-indigo-800" },
    { label: "Packing", count: stats.packing, filterKey: "Packing", color: "bg-purple-100 text-purple-800" },
    { label: "Ready to Dispatch", count: stats.readyForDispatch, filterKey: "Ready for Dispatch", color: "bg-yellow-100 text-yellow-800" },
    { label: "Shipped", count: stats.shipped, filterKey: "Shipped", color: "bg-sky text-purple-dark" },
    { label: "Out for Delivery", count: stats.outForDelivery, filterKey: "Out for Delivery", color: "bg-teal-100 text-teal-800" },
    { label: "Delivered", count: stats.delivered, filterKey: "Delivered", color: "bg-mint text-purple-dark" },
    { label: "Cancelled", count: stats.cancelled, filterKey: "Cancelled", color: "bg-red-100 text-red-800" },
    { label: "Return Requests", count: stats.returnRequested, filterKey: "Return Requested", color: "bg-rose-100 text-rose-800" },
    { label: "Refund Pending", count: stats.refundPending, filterKey: "Refund Pending", color: "bg-orange-100 text-orange-800" },
  ];

  const dbConfigStatus = getSupabaseConfigStatus();

  return (
    <div className="space-y-6">
      {/* Supabase Connection Status Bar */}
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
          <div>
            <span>
              {dbConfigStatus.configured
                ? `Supabase Orders Sync Active: Connected to ${dbConfigStatus.url}`
                : "Database Notice: Supabase credentials not found in environment."}
            </span>
          </div>
        </div>
        {!dbConfigStatus.configured && (
          <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
            Missing: {dbConfigStatus.missingFields.join(", ")}
          </span>
        )}
      </div>

      {/* Top Header and Export */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Order Management System</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">All Orders ({allOrders.length})</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => analyticsService.exportOrdersCsv(filteredOrders)}
            className="flex items-center gap-2 rounded-full border border-purple/20 bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-purple uppercase shadow-sm transition hover:bg-lilac"
          >
            <span>↓</span> Export Filtered CSV
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {actionMessage}
        </div>
      )}

      {/* Real-time Order Statistics Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {statPills.map((pill) => (
          <button
            key={pill.label}
            onClick={() => setStatusFilter(pill.filterKey)}
            className={`rounded-2xl border p-3.5 text-left transition hover:scale-[1.02] ${
              statusFilter === pill.filterKey
                ? "border-purple bg-lilac/60 shadow-md ring-2 ring-purple"
                : "border-purple/10 bg-white hover:border-purple/30"
            }`}
          >
            <p className="text-[9px] font-bold tracking-wider text-ink/45 uppercase truncate">{pill.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-purple-dark">{pill.count}</p>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-purple/10 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Search by order #, customer, phone, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-purple/15 bg-canvas px-3 py-2 text-xs outline-none focus:border-purple"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-purple/15 bg-canvas px-2.5 py-2 text-xs font-semibold outline-none"
            >
              <option value="All">All Statuses</option>
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
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-purple/15 bg-canvas px-2.5 py-2 text-xs font-semibold outline-none"
            >
              <option value="All">All Payments</option>
              {["Paid", "Pending", "Failed", "Partially Refunded", "Refunded", "Cancelled"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full rounded-xl border border-purple/15 bg-canvas px-2.5 py-2 text-xs font-semibold outline-none"
            >
              <option value="All">All Methods</option>
              {["UPI", "Card", "Cash on Delivery", "NetBanking"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Assigned Staff Filter */}
          <div>
            <select
              value={assignedStaffFilter}
              onChange={(e) => setAssignedStaffFilter(e.target.value)}
              className="w-full rounded-xl border border-purple/15 bg-canvas px-2.5 py-2 text-xs font-semibold outline-none"
            >
              <option value="All">All Staff</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Tabs */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-purple/10 pt-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-ink/40 mr-1">Time:</span>
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "week", label: "Last 7 Days" },
              { key: "month", label: "Last 30 Days" },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setDateRangeFilter(d.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  dateRangeFilter === d.key ? "bg-purple text-white" : "text-ink/60 hover:bg-lilac"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-ink/50">
            Showing <strong>{filteredOrders.length}</strong> matching orders
          </span>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedOrderIds.length > 0 && canUpdate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-purple p-4 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-purple">
              {selectedOrderIds.length}
            </span>
            <span className="text-xs font-semibold">orders selected</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkActionTarget}
              onChange={(e) => setBulkActionTarget(e.target.value)}
              className="rounded-xl border border-white/20 bg-purple-dark px-3 py-1.5 text-xs font-semibold text-white outline-none"
            >
              <option value="">Choose bulk status update...</option>
              <option value="Confirmed">Mark Confirmed</option>
              <option value="Processing">Mark Processing</option>
              <option value="Packing">Mark Packing</option>
              <option value="Ready for Dispatch">Mark Ready for Dispatch</option>
              <option value="Shipped">Mark Shipped</option>
              <option value="Delivered">Mark Delivered</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkActionTarget}
              className="rounded-xl bg-coral px-4 py-1.5 text-xs font-bold text-white uppercase transition hover:bg-white hover:text-coral disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-purple/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[55rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold tracking-wider text-ink/50 uppercase">
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-purple"
                  />
                </th>
                <th className="px-4 py-3.5">Order</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Carrier / AWB</th>
                <th className="px-4 py-3.5">Assigned</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-ink/40">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`transition hover:bg-canvas/40 ${isSelected ? "bg-lilac/30" : ""}`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="accent-purple"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-bold font-mono text-purple">
                        <button
                          onClick={() => setActiveOrderId(order.id)}
                          className="hover:underline text-left"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="block font-semibold text-ink">{order.customerName}</strong>
                        <small className="text-[10px] text-ink/45">
                          {order.shippingAddress.city}, {order.shippingAddress.pinCode}
                          {showCustomerContact && ` · ${order.customerPhone}`}
                        </small>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-ink/60 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        <span className="block text-[9px] text-ink/40">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-ink/70">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="font-semibold text-purple-dark">
                          ₹{order.grandTotal.toLocaleString("en-IN")}
                        </strong>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.paymentStatus === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {order.paymentMethod} · {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                            order.orderStatus === "Delivered"
                              ? "bg-mint text-purple-dark"
                              : order.orderStatus === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.orderStatus === "Shipped"
                              ? "bg-sky text-purple-dark"
                              : "bg-purple-100 text-purple-dark"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px]">
                        {order.shippingProvider ? (
                          <div>
                            <strong className="block text-ink">{order.shippingProvider}</strong>
                            <span className="font-mono text-[9px] text-ink/50">{order.trackingNumber || "No AWB"}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink/35">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[11px]">
                        {order.assignedStaffName ? (
                          <div>
                            <strong className="block text-ink">{order.assignedStaffName}</strong>
                            <small className="text-[9px] text-ink/40">{order.assignedStaffRole}</small>
                          </div>
                        ) : (
                          <span className="text-[10px] text-ink/35">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveOrderId(order.id)}
                          className="rounded-full bg-purple/10 px-3 py-1 text-[10px] font-bold text-purple uppercase transition hover:bg-purple hover:text-white"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrderId && (
        <OrderDetailModal
          orderId={activeOrderId}
          onClose={() => setActiveOrderId(null)}
          onOrderUpdated={() => {
            // State re-renders automatically due to db subscription
          }}
        />
      )}
    </div>
  );
}
