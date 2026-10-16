import { useState } from "react";
import { analyticsService } from "../../../backend/analyticsService";
import { db } from "../../../backend/db";
import { OrderDetailModal } from "../OrderDetailModal";

export function DashboardOverview({ onNavigate }: { onNavigate: (module: string) => void }) {
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("week");
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const summary = analyticsService.getSummary(timeFilter);
  const recentOrders = db.getOrders().slice(0, 5);
  const recentAudit = db.getRaw().auditLogs.slice(0, 6);

  return (
    <div className="space-y-7">
      {/* Top Banner and Time Filter */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Duck Cosmetics OMS</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Operations Overview</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-purple/15 bg-white p-1 text-xs">
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "all", label: "All Time" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTimeFilter(t.key as any)}
              className={`rounded-full px-3.5 py-1.5 font-bold transition ${
                timeFilter === t.key ? "bg-purple text-white shadow-sm" : "text-ink/55 hover:text-purple"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Net Sales (Recognized)</p>
          <p className="mt-3 font-display text-3xl font-bold text-purple-dark">
            ₹{summary.netSales.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-ink/50">
            <span>Gross: ₹{summary.grossSales.toLocaleString("en-IN")}</span>
            <span className="text-emerald-600 font-semibold">Collected: ₹{summary.collectedRevenue.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Total Orders</p>
          <p className="mt-3 font-display text-3xl font-bold text-purple">
            {summary.totalOrders}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-ink/50">
            <span>Delivered: {summary.ordersByStatus.Delivered}</span>
            <span>In Transit: {summary.ordersByStatus.Shipped}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Average Order Value (AOV)</p>
          <p className="mt-3 font-display text-3xl font-bold text-purple-dark">
            ₹{summary.averageOrderValue.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-ink/45">Excludes cancelled & fully refunded</p>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold tracking-wider text-ink/40 uppercase">Uncollected COD</p>
          <p className="mt-3 font-display text-3xl font-bold text-amber-600">
            ₹{summary.uncollectedCod.toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-ink/45">Awaiting delivery & driver reconciliation</p>
        </div>
      </div>

      {/* Actionable Alerts Bar */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => onNavigate("orders")}
          className="flex items-center justify-between rounded-2xl border border-purple/10 bg-canvas/70 p-4 text-left transition hover:border-purple hover:bg-lilac/30"
        >
          <div>
            <span className="text-[9px] font-bold text-purple uppercase">Orders Pending</span>
            <strong className="block text-xl font-bold">{summary.ordersByStatus["Awaiting Confirmation"] + summary.ordersByStatus["Ready for Dispatch"]}</strong>
          </div>
          <span className="rounded-full bg-lilac px-3 py-1 text-xs font-bold text-purple">Review →</span>
        </button>

        <button
          onClick={() => onNavigate("inventory")}
          className="flex items-center justify-between rounded-2xl border border-purple/10 bg-canvas/70 p-4 text-left transition hover:border-purple hover:bg-lilac/30"
        >
          <div>
            <span className="text-[9px] font-bold text-coral uppercase">Low Stock Alerts</span>
            <strong className="block text-xl font-bold text-coral">{summary.lowStockItemsCount} items</strong>
          </div>
          <span className="rounded-full bg-blush px-3 py-1 text-xs font-bold text-coral">Restock →</span>
        </button>

        <button
          onClick={() => onNavigate("returns")}
          className="flex items-center justify-between rounded-2xl border border-purple/10 bg-canvas/70 p-4 text-left transition hover:border-purple hover:bg-lilac/30"
        >
          <div>
            <span className="text-[9px] font-bold text-amber-700 uppercase">Returns Pending</span>
            <strong className="block text-xl font-bold">{summary.pendingReturnsCount} requests</strong>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Process →</span>
        </button>

        <button
          onClick={() => onNavigate("support")}
          className="flex items-center justify-between rounded-2xl border border-purple/10 bg-canvas/70 p-4 text-left transition hover:border-purple hover:bg-lilac/30"
        >
          <div>
            <span className="text-[9px] font-bold text-blue-700 uppercase">Support Tickets</span>
            <strong className="block text-xl font-bold">{summary.openTicketsCount} open</strong>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">Reply →</span>
        </button>
      </div>

      {/* Two Column Section: Recent Orders & Best Sellers */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent Orders */}
        <section className="rounded-2xl border border-purple/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Real-Time Queue</p>
              <h3 className="mt-1 font-display text-xl font-semibold">Recent Store Orders</h3>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="text-xs font-bold text-purple underline uppercase"
            >
              View all orders
            </button>
          </div>

          <div className="mt-5 divide-y divide-purple/10">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveOrderId(o.id)}
                      className="font-mono text-xs font-bold text-purple hover:underline"
                    >
                      {o.orderNumber}
                    </button>
                    <span className="text-xs font-semibold text-ink">{o.customerName}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-ink/45">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.length} items · {o.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <strong className="block text-sm font-semibold">₹{o.grandTotal.toLocaleString("en-IN")}</strong>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                      o.orderStatus === "Delivered" ? "bg-mint text-purple-dark" :
                      o.orderStatus === "Shipped" ? "bg-sky text-purple-dark" : "bg-purple-100 text-purple-dark"
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Best-Selling Products */}
        <section className="rounded-2xl border border-purple/10 bg-white p-6 shadow-sm">
          <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Performance</p>
          <h3 className="mt-1 font-display text-xl font-semibold">Top Products</h3>

          <div className="mt-5 space-y-4">
            {summary.bestSellers.slice(0, 5).map((p, idx) => (
              <div key={p.sku} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-lilac font-mono text-[10px] font-bold text-purple">
                    0{idx + 1}
                  </span>
                  <div>
                    <strong className="block font-semibold text-ink">{p.name}</strong>
                    <span className="text-[10px] text-ink/45 font-mono">{p.sku}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-purple-dark">{p.unitsSold} units</span>
                  <small className="text-[10px] text-ink/40">₹{p.revenue.toLocaleString("en-IN")}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Activity Log Mini Feed */}
      <section className="rounded-2xl border border-purple/10 bg-canvas/40 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Audit Trail</p>
            <h3 className="mt-1 font-display text-xl font-semibold">Recent Operational Changes</h3>
          </div>
          <button
            onClick={() => onNavigate("audit")}
            className="text-xs font-bold text-purple underline uppercase"
          >
            Full audit log
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentAudit.map((log) => (
            <div key={log.id} className="rounded-xl border border-purple/10 bg-white p-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="rounded bg-lilac px-1.5 py-0.5 text-[8px] font-bold text-purple uppercase">{log.module}</span>
                <span className="text-[9px] text-ink/40">{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <strong className="mt-2 block font-semibold text-ink line-clamp-1">{log.action}</strong>
              <p className="mt-1 text-[11px] text-ink/60 line-clamp-2">{log.details}</p>
              <small className="mt-2 block text-[9px] text-ink/40">By {log.staffName} ({log.staffRole})</small>
            </div>
          ))}
        </div>
      </section>

      {activeOrderId && (
        <OrderDetailModal
          orderId={activeOrderId}
          onClose={() => setActiveOrderId(null)}
        />
      )}
    </div>
  );
}
