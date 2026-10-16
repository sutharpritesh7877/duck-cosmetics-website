import { db } from "./db";

export const PRODUCTION_CLEAN_KEY = "DUCK_PRODUCTION_INITIALIZED_V1";

/**
 * Clears demo/mock products, orders, customers, shipments, and tickets for a 100% clean production launch.
 * Preserves Master Super Admin credentials and store settings.
 */
export function clearAllDemoData(actorName = "Pritesh Suthar", actorRole: any = "Owner / Super Admin"): { success: boolean; message: string } {
  try {
    const raw = db.getRaw();

    // 1. Clear demo catalog
    raw.products = [];

    // 2. Clear demo customer orders & transactions
    raw.orders = [];
    raw.shipments = [];
    raw.returns = [];
    raw.transactions = [];

    // 3. Clear demo CRM accounts and tickets
    raw.customers = [];
    raw.tickets = [];
    raw.purchaseOrders = [];

    // 4. Preserve Master Super Admin (ensure Pritesh Suthar is always present)
    const masterAdmin = raw.staff.find((s) => s.email === "sutharpritesh7877@gmail.com") || {
      id: "stf-001",
      name: "Pritesh Suthar (Owner)",
      email: "sutharpritesh7877@gmail.com",
      phone: "+91 78775 45471",
      role: "Owner / Super Admin" as const,
      isActive: true,
      permissions: ["all"],
      password: "Ram@7877545471",
      createdAt: new Date().toISOString(),
    };
    raw.staff = [masterAdmin];

    // 5. Add audit log
    db.addAuditLog({
      staffId: masterAdmin.id,
      staffName: actorName,
      staffRole: actorRole,
      action: "Production Clean Slate Initialized",
      module: "DatabaseEngine",
      details: "All demo products, orders, customers, and tickets were cleared. Master admin credentials preserved.",
    });

    // 6. Save directly and notify all reactive UI subscribers
    db.notify();

    try {
      localStorage.setItem(PRODUCTION_CLEAN_KEY, "true");
    } catch {
      // ignore
    }

    return {
      success: true,
      message: "All demo data cleared successfully. Store catalog and customer accounts are ready for production.",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to clear demo data: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Automatically ensures the database starts in clean slate state for production.
 */
export function ensureProductionCleanSlate() {
  try {
    if (typeof window === "undefined") return;
    const isCleaned = localStorage.getItem(PRODUCTION_CLEAN_KEY);
    if (!isCleaned) {
      clearAllDemoData();
      localStorage.setItem(PRODUCTION_CLEAN_KEY, "true");
    }
  } catch {
    // ignore
  }
}
