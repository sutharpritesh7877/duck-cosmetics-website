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

const STAFF_SESSION_KEY = "duck_staff_session_v1";

function loadSessionUser(): StaffUser | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STAFF_SESSION_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        const staff = db.getStaff().find((s) => s.email.toLowerCase() === parsed.email.toLowerCase());
        if (staff && staff.isActive) return staff;
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse staff session", e);
  }
  return null;
}

let currentStaffUser: StaffUser | null = loadSessionUser();

export const authService = {
  isAuthenticated(): boolean {
    return currentStaffUser !== null;
  },

  getCurrentUser(): StaffUser {
    if (!currentStaffUser) {
      const defaultStaff = db.getStaff()[0];
      return defaultStaff;
    }
    return currentStaffUser;
  },

  setCurrentUser(user: StaffUser) {
    currentStaffUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(user));
    }
    db.notify();
  },

  loginStaff(email: string, password?: string): { success: boolean; error?: string; user?: StaffUser } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail) {
      return {
        success: false,
        error: "Please enter your authorized corporate email address.",
      };
    }

    if (!cleanPassword) {
      return {
        success: false,
        error: "Please enter your security password.",
      };
    }

    // Super Admin Primary Credentials check: sutharpritesh7877@gmail.com / Ram@7877545471
    if (cleanEmail === "sutharpritesh7877@gmail.com") {
      if (cleanPassword !== "Ram@7877545471") {
        return {
          success: false,
          error: "Incorrect security password for Super Admin.",
        };
      }

      const owner = db.getStaff().find((s) => s.email.toLowerCase() === "sutharpritesh7877@gmail.com") || db.getStaff()[0];
      currentStaffUser = owner;
      if (typeof window !== "undefined") {
        localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(owner));
      }

      db.addAuditLog(
        "Super Admin Logged In",
        "Authentication",
        owner.id,
        `${owner.name} authenticated successfully with primary master credentials`
      );

      db.notify();
      return { success: true, user: owner };
    }

    // General Staff Members Check
    const staffList = db.getStaff();
    const match = staffList.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!match) {
      return {
        success: false,
        error: "Unrecognized staff corporate email. Access restricted to authorized personnel.",
      };
    }

    if (!match.isActive) {
      return {
        success: false,
        error: "This staff account has been deactivated. Please contact store management.",
      };
    }

    // Validate staff password
    if (cleanPassword !== "Ram@7877545471" && cleanPassword !== "DuckCare@2026") {
      return {
        success: false,
        error: "Invalid security password.",
      };
    }

    currentStaffUser = match;
    if (typeof window !== "undefined") {
      localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(match));
    }

    db.addAuditLog(
      "Staff Logged In",
      "Authentication",
      match.id,
      `${match.name} (${match.role}) authenticated successfully to OMS`
    );

    db.notify();
    return { success: true, user: match };
  },

  logoutStaff() {
    if (currentStaffUser) {
      db.addAuditLog(
        "Staff Logged Out",
        "Authentication",
        currentStaffUser.id,
        `${currentStaffUser.name} signed out from OMS`
      );
    }
    currentStaffUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem(STAFF_SESSION_KEY);
    }
    db.notify();
  },

  switchRole(role: StaffRole) {
    const staffList = db.getStaff();
    const match = staffList.find((s) => s.role === role && s.isActive);
    if (match) {
      currentStaffUser = match;
    } else {
      currentStaffUser = {
        ...this.getCurrentUser(),
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
      };
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(currentStaffUser));
    }
    db.notify();
  },

  can(permission: string, user: StaffUser = this.getCurrentUser()): boolean {
    if (user.role === "Owner / Super Admin") return true;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    if (permissions.includes("all")) return true;
    if (permissions.includes(permission)) return true;

    // Check wildcard like "orders:*"
    const [domain] = permission.split(":");
    if (permissions.includes(`${domain}:*`)) return true;

    return false;
  },

  canViewCustomerSensitive(user: StaffUser = this.getCurrentUser()): boolean {
    return user.role === "Owner / Super Admin" || user.role === "Admin Manager" || user.role === "Customer Support";
  },
};

