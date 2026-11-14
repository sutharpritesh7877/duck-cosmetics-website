"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  PackageCheck,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  User,
  Phone,
  MapPin,
  X,
  CreditCard,
  MessageCircle,
  Eye,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  pincode?: string;
  totalAmount: number;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
  paymentMethod: string;
  isManual: boolean;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  sellingPrice?: number;
  imageUrl: string;
  stock?: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Manual Order Creation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "Ahmedabad",
    pincode: "380054",
    paymentMethod: "WhatsApp / Manual",
    notes: "Order recorded via WhatsApp Concierge.",
  });
  const [selectedItems, setSelectedItems] = useState<
    Array<{ productId: string; title: string; price: number; quantity: number; imageUrl?: string }>
  >([]);

  const { success: toastSuccess, error: toastError } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        toastError(data.error || "Failed to load orders");
      }
    } catch {
      toastError("Network error while loading orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      toastSuccess(`Order status updated to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (err: any) {
      toastError(err.message || "Failed to update status");
    }
  };

  const handleAddItemToOrder = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          title: prod.title,
          price: prod.sellingPrice || prod.price,
          quantity: 1,
          imageUrl: prod.imageUrl,
        },
      ];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const calculatedTotal = selectedItems.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toastError("Please add at least one product to this order.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualForm,
          totalAmount: calculatedTotal,
          items: selectedItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create manual order");
      }

      toastSuccess(`Order #${data.order.orderNumber} successfully booked!`);
      setModalOpen(false);
      setManualForm({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        city: "Ahmedabad",
        pincode: "380054",
        paymentMethod: "WhatsApp / Manual",
        notes: "Order recorded via WhatsApp Concierge.",
      });
      setSelectedItems([]);
      fetchOrders();
    } catch (err: any) {
      toastError(err.message || "Failed to create manual order");
    } finally {
      setCreating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3" />
            <span>Shipped</span>
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <RotateCcw className="w-3 h-3" />
            <span>Returned</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Order Management System (OMS)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-text-dark tracking-tight">
            Client Orders & Logistics
          </h1>
          <p className="text-xs sm:text-sm text-text-gray mt-1">
            Track VIP pre-launch allocations, enter manual orders from WhatsApp or concierge calls, and manage dispatch status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-lilac text-text-gray transition"
            title="Reload orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Order (WhatsApp)</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Total Orders
          </p>
          <p className="font-serif text-3xl font-bold text-text-dark mt-1">
            {orders.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Pending Dispatch
          </p>
          <p className="font-serif text-3xl font-bold text-amber-600 mt-1">
            {orders.filter((o) => o.status === "PENDING").length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Shipped & In Transit
          </p>
          <p className="font-serif text-3xl font-bold text-blue-600 mt-1">
            {orders.filter((o) => o.status === "SHIPPED").length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Total Booked Value
          </p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
            ₹
            {orders
              .filter((o) => o.status !== "RETURNED")
              .reduce((acc, curr) => acc + curr.totalAmount, 0)
              .toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "PENDING", "SHIPPED", "DELIVERED", "RETURNED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                  statusFilter === st
                    ? "bg-primary text-white"
                    : "bg-lilac text-text-gray hover:text-text-dark hover:bg-lilac-subtle"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Client, Phone..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-lilac/40 text-[11px] font-semibold text-text-gray uppercase tracking-wider">
                <th className="py-3.5 px-5">Order #</th>
                <th className="py-3.5 px-5">Client Name & Phone</th>
                <th className="py-3.5 px-5">Formulas Ordered</th>
                <th className="py-3.5 px-5">Amount (₹)</th>
                <th className="py-3.5 px-5">Payment & Type</th>
                <th className="py-3.5 px-5">Status Pipeline</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-lilac/30 transition">
                    {/* Order Number & Date */}
                    <td className="py-4 px-5">
                      <p className="font-mono font-bold text-text-dark">{order.orderNumber}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    {/* Client Name & Phone */}
                    <td className="py-4 px-5">
                      <p className="font-semibold text-text-dark">{order.customerName}</p>
                      <p className="text-[11px] text-text-muted">{order.phone}</p>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-5 max-w-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-white border border-lilac-border px-2 py-0.5 rounded text-[11px] text-text-dark truncate"
                          >
                            {it.quantity}x {it.title}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-5 font-serif font-bold text-sm text-text-dark">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>

                    {/* Payment Method & Manual Flag */}
                    <td className="py-4 px-5">
                      <span className="text-xs text-text-dark font-medium block">
                        {order.paymentMethod}
                      </span>
                      {order.isManual && (
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-primary bg-lilac px-1.5 py-0.5 rounded mt-0.5">
                          WhatsApp / Manual
                        </span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-5">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-text-dark focus:outline-none focus:border-primary"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="RETURNED">RETURNED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-text-gray hover:text-primary hover:bg-lilac transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Order Creation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center text-primary">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-dark">
                    Book Manual Client Order
                  </h3>
                  <p className="text-xs text-text-gray">
                    For orders received via WhatsApp, telephone concierge, or VIP atelier visits.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="mt-6 space-y-6">
              {/* Client Details */}
              <div className="bg-lilac/40 p-4 rounded-2xl border border-lilac-border space-y-4">
                <p className="text-xs font-bold text-text-dark uppercase tracking-wider">
                  1. Client & Dispatch Info
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.customerName}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, customerName: e.target.value })
                      }
                      placeholder="e.g. Radhika Merchant"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Client Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.phone}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, phone: e.target.value })
                      }
                      placeholder="+91 98250 99881"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.address}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, address: e.target.value })
                      }
                      placeholder="A-1402, Satellite Heights, SG Highway"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                      City & Pincode
                    </label>
                    <input
                      type="text"
                      value={manualForm.city}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, city: e.target.value })
                      }
                      placeholder="Ahmedabad - 380054"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-text-dark uppercase tracking-wider">
                    2. Select Products for Order
                  </p>
                  <span className="text-xs text-text-muted">
                    Click formula to add to order list
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddItemToOrder(p.id)}
                      className="p-2.5 rounded-xl border border-gray-200 text-left hover:border-primary hover:bg-lilac transition flex flex-col justify-between"
                    >
                      <span className="font-semibold text-text-dark text-xs truncate">
                        {p.title}
                      </span>
                      <span className="text-[11px] font-bold text-primary mt-1">
                        ₹{(p.sellingPrice || p.price).toLocaleString("en-IN")}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Items List */}
                {selectedItems.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-lilac/70 border border-lilac-border space-y-2">
                    <p className="text-xs font-bold text-text-dark uppercase tracking-wider mb-2">
                      Order Basket ({selectedItems.length} items):
                    </p>
                    {selectedItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-semibold text-text-dark truncate">
                            {item.title}
                          </span>
                          <span className="text-text-muted">
                            ({item.quantity}x @ ₹{item.price})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-text-dark">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-lilac-border flex items-center justify-between font-serif font-bold text-sm">
                      <span>Total Calculated Order Value:</span>
                      <span className="text-primary text-base">
                        ₹{calculatedTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Payment Method
                  </label>
                  <select
                    value={manualForm.paymentMethod}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                  >
                    <option value="WhatsApp / Manual">WhatsApp / Phone Booking</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="UPI / QR Code Transfer">UPI / QR Code Transfer</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-dark mb-1">
                    Internal Concierge Notes
                  </label>
                  <input
                    type="text"
                    value={manualForm.notes}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, notes: e.target.value })
                    }
                    placeholder="e.g. VIP client requested urgent 24h dispatch"
                    className="w-full px-4 py-2.5 rounded-xl bg-lilac border border-gray-200 text-xs text-text-dark focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold uppercase text-text-gray hover:bg-lilac transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || selectedItems.length === 0}
                  className="px-7 py-2.5 rounded-xl bg-primary hover:bg-[#4A2D61] text-white text-xs font-semibold uppercase tracking-wider transition shadow-sm disabled:opacity-60"
                >
                  {creating ? "Booking Order..." : "Confirm & Book Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Order Details
                </span>
                <h3 className="font-mono text-xl font-bold text-text-dark">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-xs">
              {/* Status and Action Bar */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-lilac/70 border border-lilac-border">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-dark">Current Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Update:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white font-semibold text-text-dark"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="RETURNED">RETURNED</option>
                  </select>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-1">
                  <p className="font-bold text-text-dark uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>Customer Details</span>
                  </p>
                  <p className="font-semibold text-text-dark">{selectedOrder.customerName}</p>
                  <p className="text-text-muted">{selectedOrder.phone}</p>
                  {selectedOrder.email && <p className="text-primary">{selectedOrder.email}</p>}
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-1">
                  <p className="font-bold text-text-dark uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>Delivery Location</span>
                  </p>
                  <p className="text-text-dark leading-relaxed">{selectedOrder.address}</p>
                  <p className="text-text-muted">
                    {selectedOrder.city} - {selectedOrder.pincode}
                  </p>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="space-y-3">
                <p className="font-bold text-text-dark uppercase tracking-wider text-[11px]">
                  Ordered Formulations
                </p>
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 flex items-center justify-between bg-white hover:bg-lilac/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-lilac shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-text-dark">{item.title}</p>
                          <p className="text-text-muted text-[11px]">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-sm text-text-dark">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between font-serif font-bold text-base text-text-dark">
                  <span>Grand Total:</span>
                  <span className="text-primary text-lg">
                    ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-3.5 rounded-xl bg-lilac/50 border border-lilac-border">
                  <p className="font-semibold text-text-dark text-[11px] uppercase tracking-wider mb-1">
                    Concierge Notes:
                  </p>
                  <p className="text-text-gray italic leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
