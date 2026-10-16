import { useState } from "react";
import { analyticsService } from "../../../backend/analyticsService";
import { db } from "../../../backend/db";

export function ReportsAnalyticsModule() {
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("month");
  const summary = analyticsService.getSummary(timeFilter);
  const allOrders = db.getOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Financial & Operational Intelligence</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Reports & Business Analytics</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-purple/15 bg-white p-1 text-xs">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "7 Days" },
              { key: "month", label: "30 Days" },
              { key: "all", label: "All Time" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeFilter(t.key as any)}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  timeFilter === t.key ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => analyticsService.exportOrdersCsv(allOrders)}
            className="rounded-full bg-purple px-4 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Accounting Net Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <span className="text-[9px] font-bold tracking-wider text-ink/40 uppercase">Gross Sales</span>
          <p className="mt-2 font-display text-3xl font-bold text-ink">₹{summary.grossSales.toLocaleString("en-IN")}</p>
          <small className="text-ink/40">Before discounts & returns</small>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <span className="text-[9px] font-bold tracking-wider text-ink/40 uppercase">Promotional Discounts</span>
          <p className="mt-2 font-display text-3xl font-bold text-coral">-₹{summary.totalDiscounts.toLocaleString("en-IN")}</p>
          <small className="text-ink/40">Coupon codes & promo rules</small>
        </div>

        <div className="rounded-2xl border border-purple/10 bg-white p-5 shadow-sm">
          <span className="text-[9px] font-bold tracking-wider text-ink/40 uppercase">Refunds Processed</span>
          <p className="mt-2 font-display text-3xl font-bold text-rose-600">-₹{summary.totalRefunds.toLocaleString("en-IN")}</p>
          <small className="text-ink/40">Returns & cancellations refunded</small>
        </div>

        <div className="rounded-2xl border border-purple/20 bg-purple-dark text-white p-5 shadow-sm">
          <span className="text-[9px] font-bold tracking-wider text-lilac uppercase">Net Recognized Revenue</span>
          <p className="mt-2 font-display text-3xl font-bold text-white">₹{summary.netSales.toLocaleString("en-IN")}</p>
          <small className="text-white/60">Gross - Discounts - Refunds</small>
        </div>
      </div>

      {/* Payment & Category Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Methods Breakdown */}
        <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Tender Types</span>
          <h3 className="mt-1 font-display text-xl font-bold">Payment Methods Breakdown</h3>

          <div className="mt-5 space-y-3 text-xs">
            {[
              { name: "UPI (Google Pay, PhonePe, Paytm)", ...summary.paymentBreakdown.upi, color: "bg-purple" },
              { name: "Debit & Credit Cards (3D Secure)", ...summary.paymentBreakdown.card, color: "bg-sky-600" },
              { name: "Cash on Delivery (COD)", ...summary.paymentBreakdown.cod, color: "bg-amber-600" },
              { name: "NetBanking / Other", ...summary.paymentBreakdown.netBanking, color: "bg-teal-600" },
            ].map((pm) => (
              <div key={pm.name} className="rounded-2xl bg-canvas/40 p-3">
                <div className="flex justify-between items-center">
                  <strong className="text-ink">{pm.name}</strong>
                  <span className="font-bold text-purple-dark">₹{pm.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-ink/50">
                  <span>{pm.count} orders</span>
                  <span>{summary.grossSales > 0 ? `${Math.round((pm.amount / summary.grossSales) * 100)}% of total` : "0%"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sales by Category */}
        <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Category Breakdown</span>
          <h3 className="mt-1 font-display text-xl font-bold">Revenue by Product Line</h3>

          <div className="mt-5 space-y-3 text-xs">
            {summary.categorySales.map((c) => (
              <div key={c.category} className="rounded-2xl bg-canvas/40 p-3">
                <div className="flex justify-between items-center">
                  <strong className="text-purple-dark text-sm">{c.category}</strong>
                  <span className="font-bold text-purple-dark">₹{c.revenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-ink/50">
                  <span>{c.count} items sold</span>
                  <span>Avg price: ₹{c.count > 0 ? Math.round(c.revenue / c.count) : 0}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bestseller Catalog Ranking */}
      <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
        <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Sales Velocity</span>
        <h3 className="mt-1 font-display text-xl font-bold">Best-Selling Products Ranking</h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-purple/10 bg-canvas/70 text-[9px] font-bold text-ink/50 uppercase">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple/5">
              {summary.bestSellers.map((item, idx) => (
                <tr key={item.sku} className="hover:bg-canvas/30">
                  <td className="py-3 px-4 font-bold text-purple">#{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-ink">{item.name}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-ink/40">{item.sku}</td>
                  <td className="py-3 px-4 text-center font-bold text-ink/80">{item.unitsSold} units</td>
                  <td className="py-3 px-4 text-right font-bold text-purple-dark">₹{item.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
