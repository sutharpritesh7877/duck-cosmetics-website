import { StaffRole, StaffUser } from "../types";
import { db } from "./db";

export const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  "Owner / Super Admin": [
    "all",
    "orders:view", "orders:create", "orders:update", "orders:cancel", "orders:assign",
    "products:view", "products:create", "products:update", "products:delete",
    "inventory:view", "inventory:adjust",
    "shipping:view", "shipping:dispatch", "shipping:deliver",
    "returns:view", "returns:approve", "returns:refund",
    "customers:view", "customers:edit",
    "staff:view", "staff:manage",
    "coupons:manage",
    "content:manage",
    "payments:view", "payments:manage",
    "invoices:view", "invoices:print",
    "notifications:view", "notifications:resend",
    "reports:view", "reports:export",
    "support:view", "support:reply",
    "settings:manage",
    "audit:view",
    "suppliers:manage",
  ],
  "Admin Manager": [
    "orders:view", "orders:update", "orders:assign", "orders:cancel",
    "products:view", "products:create", "products:update",
    "inventory:view", "inventory:adjust",
    "shipping:view", "shipping:dispatch",
    "returns:view", "returns:approve",
    "customers:view",
    "staff:view",
    "coupons:manage",
    "content:manage",
    "payments:view",
    "invoices:view", "invoices:print",
    "notifications:view",
    "reports:view", "reports:export",
    "support:view", "support:reply",
    "audit:view",
    "suppliers:manage",
  ],
  "Order Processing": [
    "orders:view", "orders:update",
    "products:view",
    "inventory:view",
    "invoices:view", "invoices:print",
    "customers:view",
  ],
  "Packing Staff": [
    "orders:view",
    "orders:update", // pack status
    "invoices:print", // packing slip
    "inventory:view",
  ],
  "Shipping Staff": [
    "orders:view",
    "orders:update", // ship status
    "shipping:view", "shipping:dispatch", "shipping:deliver",
    "invoices:print", // shipping label
  ],
  "Finance Staff": [
    "orders:view",
    "payments:view", "payments:manage",
    "returns:view", "returns:refund",
    "invoices:view", "invoices:print",
    "reports:view", "reports:export",
    "audit:view",
  ],
  "Customer Support": [
    "orders:view",
    "customers:view", "customers:edit",
    "support:view", "support:reply",
    "returns:view", "returns:create",
    "notifications:view",
  ],
};

let currentStaffUser: StaffUser = db.getStaff()[0]; // Default to Owner

export const authService = {
  getCurrentUser(): StaffUser {
    return currentStaffUser;
  },

  setCurrentUser(user: StaffUser) {
    currentStaffUser = user;
    db.notify();
  },

  switchRole(role: StaffRole) {
    const staffList = db.getStaff();
    const match = staffList.find((s) => s.role === role && s.isActive);
    if (match) {
      currentStaffUser = match;
    } else {
      currentStaffUser = {
        ...currentStaffUser,
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
      };
    }
    db.notify();
  },

  can(permission: string, user: StaffUser = currentStaffUser): boolean {
    if (user.role === "Owner / Super Admin") return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    if (permissions.includes("all")) return true;
    if (permissions.includes(permission)) return true;

    // Check wildcard like "orders:*"
    const [domain] = permission.split(":");
    if (permissions.includes(`${domain}:*`)) return true;

    return false;
  },

  canViewCustomerSensitive(user: StaffUser = currentStaffUser): boolean {
    return user.role === "Owner / Super Admin" || user.role === "Admin Manager" || user.role === "Customer Support";
  },
};
