export type CategoryName = "Baby Care" | "Face Wash" | "Vapor Rub" | "Ortho Pain Oil" | "Cosmetics";

export type OrderStatus =
  | "New"
  | "Awaiting Confirmation"
  | "Confirmed"
  | "Processing"
  | "Packing"
  | "Ready for Dispatch"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Return Requested"
  | "Refund Pending"
  | "Refunded";

export type PaymentMethod = "UPI" | "Card" | "NetBanking" | "Cash on Delivery";

export type PaymentStatus =
  | "Pending"
  | "Authorized"
  | "Paid"
  | "Failed"
  | "Partially Refunded"
  | "Refunded"
  | "Cancelled";

export type ShippingProvider =
  | "Delhivery"
  | "BlueDart"
  | "Shiprocket"
  | "DTDC"
  | "India Post"
  | "Local Express / In-House";

export type StaffRole =
  | "Owner / Super Admin"
  | "Admin Manager"
  | "Customer Support"
  | "Order Processing"
  | "Packing Staff"
  | "Shipping Staff"
  | "Finance Staff";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  phone: string;
  avatar?: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: CategoryName;
  sku: string;
  detail: string;
  mrp: number;
  price: number;
  costPrice: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  hsnCode: string;
  gstRate: number; // e.g. 18 for 18%
  image: string;
  badge?: string;
  status: "Active" | "Draft" | "Archived";
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  category: CategoryName;
  sku: string;
  image: string;
  quantity: number;
  mrp: number;
  price: number;
  discount: number;
  gstRate: number;
  taxAmount: number;
  total: number;
}

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  status: OrderStatus;
  actor: string;
  actorRole: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. DU2026-4821
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  shippingFee: number;
  taxTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionRef?: string;
  paymentDate?: string;
  orderStatus: OrderStatus;
  shippingStatus: "Unfulfilled" | "Packed" | "Manifested" | "In Transit" | "Out for Delivery" | "Delivered" | "RTO" | "Failed";
  shippingProvider?: ShippingProvider;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffRole?: StaffRole;
  taskStatus?: string;
  customerNotes?: string;
  packingNotes?: string;
  internalStaffNotes?: string;
  timeline: OrderTimelineEvent[];
  invoiceNumber?: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  change: number; // e.g. +20 or -5
  previousStock: number;
  newStock: number;
  reason: "Stock Count Audit" | "Damaged / Spoiled" | "Supplier Restock" | "Return Approved" | "Promotional Sample" | "Correction";
  notes?: string;
  performedBy: string;
  performedAt: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string; // e.g. SHP-2026-001
  orderId: string;
  orderNumber: string;
  customerName: string;
  shippingAddress: Address;
  carrier: ShippingProvider;
  trackingNumber: string;
  trackingUrl: string;
  labelUrl?: string;
  packagesCount: number;
  weightGrams: number;
  status: "Manifested" | "In Transit" | "Out for Delivery" | "Delivered" | "Delivery Failed" | "RTO Initiated" | "RTO Delivered";
  dispatchedAt: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  failedAttempts: number;
}

export interface ReturnRequest {
  id: string;
  requestNumber: string; // e.g. RET-2026-001
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  reason: "Damaged on Arrival" | "Wrong Product Sent" | "Expired / Quality Issue" | "Allergic Reaction" | "Defective Seal / Leakage" | "Customer Remorse (Unopened)";
  customerComments: string;
  imageUrl?: string;
  status: "Return Requested" | "Under Review" | "Approved" | "Rejected" | "Item Received" | "Inspection Passed" | "Inspection Failed" | "Refund Processing" | "Refunded" | "Closed";
  rejectionReason?: string;
  receivedCondition?: "Pristine Unopened" | "Opened Intact" | "Damaged / Broken" | "Counterfeit / Altered";
  restockingDecision?: "Restock for Resale" | "Quarantine / Write-off" | "Returned to Supplier";
  refundAmount: number;
  refundStatus: "Pending" | "Initiated" | "Processed" | "Rejected";
  refundTransactionRef?: string;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  method: PaymentMethod;
  type: "Payment" | "Refund" | "COD Collection" | "COD Settlement";
  amount: number;
  status: "Success" | "Pending" | "Failed";
  gatewayResponseId?: string;
  verifiedAt: string;
  notes?: string;
  recordedBy: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: "Active" | "Blocked" | "VIP";
  internalNotes?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g. TKT-2026-001
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber?: string;
  subject: string;
  category: "Order Support" | "Product Information" | "Return / Refund" | "Payment Issue" | "Delivery Delay" | "Wholesale Inquiry" | "Feedback";
  priority: "Urgent" | "High" | "Normal" | "Low";
  status: "Open" | "In Progress" | "Waiting on Customer" | "Resolved" | "Closed";
  assignedTo?: string;
  messages: {
    id: string;
    sender: "Customer" | "Support Agent";
    senderName: string;
    text: string;
    timestamp: string;
  }[];
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  suppliedCategories: CategoryName[];
  paymentTerms: string;
  status: "Active" | "Inactive";
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-2026-001
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    receivedQuantity: number;
  }[];
  totalAmount: number;
  status: "Draft" | "Sent to Supplier" | "Partially Received" | "Fully Received" | "Cancelled";
  expectedDelivery: string;
  notes?: string;
  createdAt: string;
  receivedAt?: string;
}

export interface NotificationLog {
  id: string;
  orderId?: string;
  orderNumber?: string;
  recipient: string;
  channel: "Email" | "SMS" | "WhatsApp";
  type: "Order Placed" | "Order Confirmed" | "Order Packed" | "Order Shipped" | "Out for Delivery" | "Delivered" | "Order Cancelled" | "Return Approved" | "Refund Processed" | "Payment Failed";
  subject: string;
  body: string;
  status: "Sent" | "Failed" | "Queued";
  sentAt: string;
  error?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  staffRole: StaffRole;
  action: string;
  module: string;
  targetId?: string;
  details: string;
  ipAddress?: string;
}

export interface StoreSettings {
  storeName: string;
  legalEntityName: string;
  brandTagline: string;
  supportEmail: string;
  supportPhone1: string;
  supportPhone2: string;
  supportPhone3: string;
  address: string;
  gstin: string;
  pan: string;
  stateCode: string; // 24 for Gujarat
  currency: "INR";
  currencySymbol: "₹";
  standardShippingFee: number;
  freeShippingThreshold: number;
  returnWindowDays: number;
  autoFreeFaceWashOffer: boolean;
  announcementTicker: string[];
  serviceablePinCodes: string[];
  maintenanceMode: boolean;
  productionDbConfig?: {
    provider: "supabase" | "postgresql" | "firebase" | "mongodb" | "custom_rest";
    apiUrl: string;
    apiKey: string;
    databaseName?: string;
    storageBucket?: string;
    connected: boolean;
  };
  paymentGatewayConfig?: {
    provider: "razorpay" | "phonepe" | "cashfree" | "stripe";
    keyId: string;
    keySecret: string;
    active: boolean;
  };
  shippingCarrierConfig?: {
    provider: "shiprocket" | "delhivery" | "bluedart";
    apiKey: string;
    token: string;
    active: boolean;
  };
}
