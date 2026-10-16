import { useState, useEffect } from "react";
import { authService } from "../../backend/authService";
import { db } from "../../backend/db";
import { StaffRole } from "../../types";

// Import all 18+ modules
import { DashboardOverview } from "./modules/DashboardOverview";
import { OrdersModule } from "./modules/OrdersModule";
import { ProductsModule } from "./modules/ProductsModule";
import { CategoriesModule } from "./modules/CategoriesModule";
import { InventoryModule } from "./modules/InventoryModule";
import { ShippingModule } from "./modules/ShippingModule";
import { ReturnsRefundsModule } from "./modules/ReturnsRefundsModule";
import { CustomersModule } from "./modules/CustomersModule";
import { StaffPermissionsModule } from "./modules/StaffPermissionsModule";
import { CouponsModule } from "./modules/CouponsModule";
import { WebsiteContentModule } from "./modules/WebsiteContentModule";
import { PaymentsModule } from "./modules/PaymentsModule";
import { InvoicesModule } from "./modules/InvoicesModule";
import { NotificationsModule } from "./modules/NotificationsModule";
import { ReportsAnalyticsModule } from "./modules/ReportsAnalyticsModule";
import { CustomerSupportModule } from "./modules/CustomerSupportModule";
import { WebsiteSettingsModule } from "./modules/WebsiteSettingsModule";
import { SecurityAuditModule } from "./modules/SecurityAuditModule";
import { SuppliersModule } from "./modules/SuppliersModule";

export function AdminLayout({ onBackToStore }: { onBackToStore: () => void }) {
  const [activeModule, setActiveModule] = useState<string>("overview");
  const [currentStaff, setCurrentStaff] = useState(authService.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setDbVersion] = useState(0);

  // Subscribe to DB changes for reactive badges
  useEffect(() => {
    return db.subscribe(() => {
      setDbVersion((v) => v + 1);
      setCurrentStaff(authService.getCurrentUser());
    });
  }, []);

  const orders = db.getOrders();
  const products = db.getProducts();
  const returns = db.getReturns();
  const tickets = db.getTickets();

  const newOrdersCount = orders.filter((o) => o.orderStatus === "New" || o.orderStatus === "Awaiting Confirmation").length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;
  const pendingReturnsCount = returns.filter((r) => r.status === "Return Requested" || r.refundStatus === "Pending").length;
  const openTicketsCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;

  const navigationItems: { id: string; label: string; badge?: number; badgeColor?: string }[] = [
    { id: "overview", label: "1. Dashboard Overview" },
    { id: "orders", label: "2. Orders", badge: newOrdersCount, badgeColor: "bg-coral text-white" },
    { id: "products", label: "3. Products" },
    { id: "categories", label: "4. Categories" },
    { id: "inventory", label: "5. Inventory & Stock", badge: lowStockCount, badgeColor: "bg-amber-500 text-white" },
    { id: "shipping", label: "6. Shipping & Delivery" },
    { id: "returns", label: "7. Returns & Refunds", badge: pendingReturnsCount, badgeColor: "bg-rose-500 text-white" },
    { id: "customers", label: "8. Customers" },
    { id: "staff", label: "9. Staff & Permissions" },
    { id: "coupons", label: "10. Coupons & Promotions" },
    { id: "content", label: "11. Website Content" },
    { id: "payments", label: "12. Payments & Transactions" },
    { id: "invoices", label: "13. Invoices" },
    { id: "notifications", label: "14. Notifications" },
    { id: "reports", label: "15. Reports & Analytics" },
    { id: "support", label: "16. Customer Support", badge: openTicketsCount, badgeColor: "bg-blue-500 text-white" },
    { id: "settings", label: "17. Website Settings" },
    { id: "audit", label: "18. Security & Audit Logs" },
    { id: "suppliers", label: "19. Suppliers & Purchase Orders" },
  ];

  const handleRoleChange = (role: StaffRole) => {
    authService.switchRole(role);
    setCurrentStaff(authService.getCurrentUser());
  };

  const renderActiveModule = () => {
    switch (activeModule) {
      case "overview":
        return <DashboardOverview onNavigate={(mod) => setActiveModule(mod)} />;
      case "orders":
        return <OrdersModule />;
      case "products":
        return <ProductsModule />;
      case "categories":
        return <CategoriesModule />;
      case "inventory":
        return <InventoryModule />;
      case "shipping":
        return <ShippingModule />;
      case "returns":
        return <ReturnsRefundsModule />;
      case "customers":
        return <CustomersModule />;
      case "staff":
        return <StaffPermissionsModule />;
      case "coupons":
        return <CouponsModule />;
      case "content":
        return <WebsiteContentModule />;
      case "payments":
        return <PaymentsModule />;
      case "invoices":
        return <InvoicesModule />;
      case "notifications":
        return <NotificationsModule />;
      case "reports":
        return <ReportsAnalyticsModule />;
      case "support":
        return <CustomerSupportModule />;
      case "settings":
        return <WebsiteSettingsModule />;
      case "audit":
        return <SecurityAuditModule />;
      case "suppliers":
        return <SuppliersModule />;
      default:
        return <DashboardOverview onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  return (
    <div className="min-h-screen bg-admin text-ink flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 flex-col bg-purple-dark p-5 text-white transition-transform lg:static lg:flex lg:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full"
      }`}>
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-white p-1.5 shadow-sm">
              <img src="/duck-logo.png" alt="Duck" className="h-9 w-24 object-contain" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-lilac">Admin OMS</p>
              <span className="block text-[8px] tracking-wider text-white/50 uppercase">Order Management</span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Staff Role Switcher */}
        <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs">
          <span className="block text-[8px] font-bold tracking-wider text-lilac uppercase">Simulate Role / Staff:</span>
          <select
            value={currentStaff.role}
            onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
            className="mt-1.5 w-full rounded-xl bg-purple-dark border border-white/20 p-2 text-xs font-semibold text-white outline-none cursor-pointer"
          >
            <option value="Owner / Super Admin">👑 Owner / Super Admin</option>
            <option value="Admin Manager">⚡ Admin Manager</option>
            <option value="Order Processing">📋 Order Processing</option>
            <option value="Packing Staff">📦 Packing Staff</option>
            <option value="Shipping Staff">🚚 Shipping Staff</option>
            <option value="Finance Staff">💰 Finance Staff</option>
            <option value="Customer Support">💬 Customer Support</option>
          </select>
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/60">
            <span>Signed: {currentStaff.name}</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* 18 Navigation Links */}
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1 text-xs">
          {navigationItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left font-semibold transition ${
                  isActive
                    ? "bg-white text-purple shadow-sm font-bold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${item.badgeColor || "bg-lilac text-purple"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
          <button
            onClick={onBackToStore}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-lilac/10 py-2.5 text-xs font-bold tracking-wider text-lilac uppercase transition hover:bg-white hover:text-purple"
          >
            <span>←</span> Live Storefront
          </button>
          <button
            onClick={() => {
              if (confirm("Reset database to initial demo state? All orders, products, and logs will be restored.")) {
                db.resetToFactory();
                setActiveModule("overview");
              }
            }}
            className="w-full text-center text-[9px] font-bold text-white/40 uppercase hover:text-coral transition"
          >
            Reset Seed Data
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-purple/10 bg-white/95 px-5 py-3.5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-lilac text-purple lg:hidden"
              aria-label="Open navigation"
            >
              ☰
            </button>
            <div>
              <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Duck Cosmetics OMS</p>
              <h1 className="font-display text-xl font-bold text-purple-dark capitalize sm:text-2xl">
                {navigationItems.find((n) => n.id === activeModule)?.label || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-purple/20 bg-canvas px-4 py-2 text-xs font-bold tracking-wider text-purple uppercase transition hover:bg-lilac"
            >
              <span>↗</span> View Store
            </button>
            <div className="flex items-center gap-2 rounded-full border border-purple/15 bg-white p-1 pl-3 shadow-xs">
              <span className="hidden sm:block text-right">
                <strong className="block text-xs text-ink leading-none">{currentStaff.name}</strong>
                <small className="text-[9px] text-ink/40 font-semibold">{currentStaff.role}</small>
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-purple font-bold text-white text-xs">
                {currentStaff.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 p-4 md:p-8">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
}
