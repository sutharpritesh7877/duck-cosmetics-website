"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackageCheck,
  Truck,
  FileDown,
  Eye,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
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
  notes?: string;
  items: OrderItem[];
  createdAt: string;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { formatPrice } = useCurrency();
  const { error: toastError } = useToast();

  useEffect(() => {
    let isMounted = true;
    fetch("/api/account/orders")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch((err) => {
        console.warn("Orders fetch error:", err);
        toastError("Unable to load orders at this time.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Delivered",
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "SHIPPED":
        return {
          label: "In Transit / Shipped",
          className: "bg-sky-50 text-sky-800 border-sky-200",
        };
      case "RETURNED":
        return {
          label: "Returned",
          className: "bg-rose-50 text-rose-800 border-rose-200",
        };
      case "PENDING":
      default:
        return {
          label: "Processing / Pending",
          className: "bg-amber-50 text-amber-800 border-amber-200",
        };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-text-dark font-normal">
          My Order History
        </h2>
        <p className="text-xs sm:text-sm text-text-gray mt-1">
          Review your previous atelier dispatches, access real-time courier tracking, and download official tax invoices.
        </p>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="p-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border animate-pulse h-40"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 px-6 rounded-3xl bg-[#F8F6FA] border border-lilac-border max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-primary mx-auto mb-4 shadow-sm border border-lilac-border">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-text-dark">
            Your beauty ritual awaits.
          </h3>
          <p className="text-xs sm:text-sm text-text-gray mt-2 leading-relaxed max-w-sm mx-auto">
            Explore our collections and experience the synergy of uncompromising clinical dermatology and haute couture pleasure.
          </p>
          <div className="mt-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition shadow-md shadow-primary/20"
            >
              <span>Explore The Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const items = order.items || [];

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-lilac-border shadow-xs hover:shadow-[0_10px_30px_rgba(93,58,122,0.06)] transition-all duration-300"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif text-lg font-bold text-text-dark">
                        Order #{order.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-text-dark">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lilac text-primary text-xs font-semibold uppercase tracking-wider hover:bg-lilac-subtle transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>

                    <Link
                      href={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F6FA] text-text-dark border border-lilac-border text-xs font-semibold uppercase tracking-wider hover:bg-lilac transition"
                    >
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      <span>Track Order</span>
                    </Link>

                    <a
                      href={`/api/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition shadow-xs"
                      title="Download Official Tax Invoice (PDF)"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </a>
                  </div>
                </div>

                {/* Items Thumbnails Row */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2 rounded-2xl bg-[#F8F6FA] border border-lilac-border shrink-0"
                      >
                        {item.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-lilac shrink-0 border border-lilac-border">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-lilac flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            DC
                          </div>
                        )}
                        <div className="truncate max-w-[160px]">
                          <p className="font-serif text-xs font-bold text-text-dark truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            Qty: {item.quantity} · {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-text-muted uppercase tracking-wider block">
                      Payment
                    </span>
                    <span className="text-xs font-semibold text-text-dark">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-lilac-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-serif text-xl font-bold text-text-dark">
                    Order Details #{selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full text-text-muted hover:text-text-dark hover:bg-lilac transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items Table */}
              <div className="mt-5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                  Items Purchased
                </span>
                <div className="divide-y divide-gray-100 border border-lilac-border rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 sm:p-4 flex items-center justify-between bg-white text-xs">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-lilac shrink-0">
                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-serif font-bold text-text-dark text-sm">{item.title}</p>
                          <p className="text-text-muted text-[11px]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-text-dark">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address & Payment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">
                <div className="p-4 rounded-2xl bg-[#F8F6FA] border border-lilac-border">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase tracking-wider mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="font-semibold text-text-dark">{selectedOrder.customerName}</p>
                  <p className="text-text-gray mt-1 leading-relaxed">{selectedOrder.address}</p>
                  <p className="text-text-gray">{selectedOrder.city} {selectedOrder.pincode}</p>
                  <p className="text-text-muted mt-1">Phone: {selectedOrder.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F6FA] border border-lilac-border">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase tracking-wider mb-2">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment & Summary</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Method:</span>
                      <span className="font-medium text-text-dark">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Shipping:</span>
                      <span className="text-emerald-600 font-medium">Complimentary</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-lilac-border/60 font-serif font-bold text-sm text-primary">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <a
                  href={`/api/orders/${selectedOrder.id}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#4A2D61] transition"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Tax Invoice (PDF)</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
