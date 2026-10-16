import { Order, OrderStatus } from "../types";
import { db } from "./db";

export interface AnalyticsSummary {
  grossSales: number;
  totalDiscounts: number;
  totalRefunds: number;
  netSales: number;
  collectedRevenue: number;
  uncollectedCod: number;
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  paymentBreakdown: {
    upi: { count: number; amount: number };
    card: { count: number; amount: number };
    cod: { count: number; amount: number };
    netBanking: { count: number; amount: number };
  };
  categorySales: { category: string; count: number; revenue: number }[];
  bestSellers: { name: string; sku: string; unitsSold: number; revenue: number }[];
  lowStockItemsCount: number;
  pendingReturnsCount: number;
  openTicketsCount: number;
}

export const analyticsService = {
  getSummary(timeRange: "all" | "today" | "week" | "month" = "all"): AnalyticsSummary {
    const orders = db.getOrders();
    const products = db.getProducts();
    const returns = db.getReturns();
    const tickets = db.getTickets();

    const now = new Date();
    const filteredOrders = orders.filter((order) => {
      if (timeRange === "all") return true;
      const orderDate = new Date(order.createdAt);
      if (timeRange === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (timeRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      }
      if (timeRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= monthAgo;
      }
      return true;
    });

    let grossSales = 0;
    let totalDiscounts = 0;
    let collectedRevenue = 0;
    let uncollectedCod = 0;

    const ordersByStatus: Record<OrderStatus, number> = {
      New: 0,
      "Awaiting Confirmation": 0,
      Confirmed: 0,
      Processing: 0,
      Packing: 0,
      "Ready for Dispatch": 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
      "Return Requested": 0,
      "Refund Pending": 0,
      Refunded: 0,
    };

    const paymentBreakdown = {
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      cod: { count: 0, amount: 0 },
      netBanking: { count: 0, amount: 0 },
    };

    const productSalesMap: Record<string, { name: string; sku: string; unitsSold: number; revenue: number }> = {};
    const categorySalesMap: Record<string, { count: number; revenue: number }> = {};

    filteredOrders.forEach((order) => {
      ordersByStatus[order.orderStatus] = (ordersByStatus[order.orderStatus] || 0) + 1;

      if (order.orderStatus !== "Cancelled") {
        grossSales += order.subtotal;
        totalDiscounts += order.discountTotal;

        if (order.paymentStatus === "Paid") {
          collectedRevenue += order.amountPaid;
        } else if (order.paymentMethod === "Cash on Delivery") {
          uncollectedCod += order.amountDue;
        }

        const methodKey =
          order.paymentMethod === "UPI"
            ? "upi"
            : order.paymentMethod === "Card"
            ? "card"
            : order.paymentMethod === "Cash on Delivery"
            ? "cod"
            : "netBanking";

        paymentBreakdown[methodKey].count += 1;
        paymentBreakdown[methodKey].amount += order.grandTotal;

        order.items.forEach((item) => {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = {
              name: item.name,
              sku: item.sku,
              unitsSold: 0,
              revenue: 0,
            };
          }
          productSalesMap[item.productId].unitsSold += item.quantity;
          productSalesMap[item.productId].revenue += item.total;

          if (!categorySalesMap[item.category]) {
            categorySalesMap[item.category] = { count: 0, revenue: 0 };
          }
          categorySalesMap[item.category].count += item.quantity;
          categorySalesMap[item.category].revenue += item.total;
        });
      }
    });

    const totalRefunds = returns
      .filter((r) => r.refundStatus === "Processed" || r.status === "Refunded")
      .reduce((sum, r) => sum + r.refundAmount, 0);

    const netSales = Math.max(0, grossSales - totalDiscounts - totalRefunds);
    const nonCancelledCount = filteredOrders.filter((o) => o.orderStatus !== "Cancelled").length;
    const averageOrderValue = nonCancelledCount > 0 ? Math.round(netSales / nonCancelledCount) : 0;

    const bestSellers = Object.values(productSalesMap).sort((a, b) => b.unitsSold - a.unitsSold);
    const categorySales = Object.entries(categorySalesMap).map(([category, val]) => ({
      category,
      count: val.count,
      revenue: val.revenue,
    }));

    const lowStockItemsCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
    const pendingReturnsCount = returns.filter((r) => r.status === "Return Requested" || r.status === "Under Review" || r.refundStatus === "Pending").length;
    const openTicketsCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;

    return {
      grossSales,
      totalDiscounts,
      totalRefunds,
      netSales,
      collectedRevenue,
      uncollectedCod,
      totalOrders: filteredOrders.length,
      averageOrderValue,
      ordersByStatus,
      paymentBreakdown,
      categorySales,
      bestSellers,
      lowStockItemsCount,
      pendingReturnsCount,
      openTicketsCount,
    };
  },

  exportOrdersCsv(orders: Order[]): void {
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Customer Email",
      "City",
      "State",
      "PIN Code",
      "Items Count",
      "Subtotal",
      "Discount",
      "Shipping Fee",
      "Grand Total",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Carrier",
      "Tracking Number",
      "Assigned Staff",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString("en-IN")}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${o.shippingAddress.city}"`,
      `"${o.shippingAddress.state}"`,
      `"${o.shippingAddress.pinCode}"`,
      o.items.length,
      o.subtotal,
      o.discountTotal,
      o.shippingFee,
      o.grandTotal,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.shippingProvider || ""}"`,
      `"${o.trackingNumber || ""}"`,
      `"${o.assignedStaffName || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Duck_Cosmetics_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
