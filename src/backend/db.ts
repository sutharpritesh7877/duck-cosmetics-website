import {
  ProductItem,
  Order,
  Customer,
  StaffUser,
  Shipment,
  ReturnRequest,
  PaymentTransaction,
  Coupon,
  SupportTicket,
  Supplier,
  PurchaseOrder,
  NotificationLog,
  AuditLog,
  StoreSettings,
} from "../types";

export interface DatabaseSchema {
  version: number;
  products: ProductItem[];
  orders: Order[];
  customers: Customer[];
  staff: StaffUser[];
  shipments: Shipment[];
  returns: ReturnRequest[];
  transactions: PaymentTransaction[];
  coupons: Coupon[];
  tickets: SupportTicket[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  notifications: NotificationLog[];
  auditLogs: AuditLog[];
  settings: StoreSettings;
}

const STORAGE_KEY = "DUCK_COSMETICS_DB_V1";

export const initialSettings: StoreSettings = {
  storeName: "Duck Cosmetics",
  legalEntityName: "Duck Care Private Limited",
  brandTagline: "Care for Every Little Moment",
  supportEmail: "crm@duckcosmetics.in",
  supportPhone1: "+91 98250 10194",
  supportPhone2: "+91 83202 64296",
  supportPhone3: "+91 95123 10194",
  address: "A/404, 4th Floor, Doctor House, Near Parimal Crossing, Ellis Bridge, Ahmedabad – 380006, Gujarat, India.",
  gstin: "24AAACD1234F1Z8",
  pan: "AAACD1234F",
  stateCode: "24",
  currency: "INR",
  currencySymbol: "₹",
  standardShippingFee: 79,
  freeShippingThreshold: 999,
  returnWindowDays: 7,
  autoFreeFaceWashOffer: true,
  announcementTicker: [
    "Free India shipping on orders over ₹999",
    "Buy any cosmetic, get a free Daily Fresh Face Wash",
    "Fast delivery across India with live SMS tracking",
    "Dermatologically tested · Gentle plant formulations",
  ],
  serviceablePinCodes: [
    "380006", "380001", "380015", "400001", "400050", "110001", "110020",
    "560001", "560034", "600001", "700001", "500001", "302001", "226001",
  ],
  maintenanceMode: false,
};

export const initialStaff: StaffUser[] = [
  {
    id: "stf-001",
    name: "Pritesh Suthar (Owner)",
    email: "sutharpritesh7877@gmail.com",
    phone: "+91 78775 45471",
    role: "Owner / Super Admin",
    isActive: true,
    permissions: ["all"],
    password: "Ram@7877545471",
    createdAt: "2026-01-01T09:00:00Z",
  },
  {
    id: "stf-002",
    name: "Pooja Patel",
    email: "pooja.ops@duck.care",
    phone: "+91 83202 64296",
    role: "Admin Manager",
    isActive: true,
    permissions: ["orders:manage", "inventory:manage", "staff:view", "reports:view", "shipments:manage"],
    password: "Manager@2026",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "stf-003",
    name: "Rohan Varma",
    email: "rohan.orders@duck.care",
    phone: "+91 95123 10194",
    role: "Order Processing",
    isActive: true,
    permissions: ["orders:read", "orders:confirm", "orders:process"],
    password: "Orders@2026",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "stf-004",
    name: "Karan Dave",
    email: "karan.pack@duck.care",
    phone: "+91 98980 12345",
    role: "Packing Staff",
    isActive: true,
    permissions: ["orders:read", "orders:pack", "invoices:print_slip"],
    password: "Packing@2026",
    createdAt: "2026-02-05T10:00:00Z",
  },
  {
    id: "stf-005",
    name: "Vikas Chauhan",
    email: "vikas.ship@duck.care",
    phone: "+91 98790 54321",
    role: "Shipping Staff",
    isActive: true,
    permissions: ["shipments:manage", "orders:ship", "orders:deliver"],
    password: "Shipping@2026",
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "stf-006",
    name: "Meera Shah",
    email: "meera.finance@duck.care",
    phone: "+91 98240 67890",
    role: "Finance Staff",
    isActive: true,
    permissions: ["payments:manage", "refunds:process", "reports:view", "invoices:view"],
    password: "Finance@2026",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "stf-007",
    name: "Ananya Joshi",
    email: "ananya.support@duck.care",
    phone: "+91 97230 45678",
    role: "Customer Support",
    isActive: true,
    permissions: ["support:manage", "customers:read", "orders:read", "returns:create"],
    password: "Support@2026",
    createdAt: "2026-02-20T10:00:00Z",
  },
];

export const initialProducts: ProductItem[] = [
  {
    id: "prd-001",
    name: "Duck Baby Soft Lotion",
    category: "Baby Care",
    sku: "DUCK-BB-LOT-200",
    detail: "Calendula + oat milk · 200 ml",
    mrp: 499,
    price: 449,
    costPrice: 190,
    stock: 84,
    reservedStock: 2,
    lowStockThreshold: 15,
    hsnCode: "33049910",
    gstRate: 18,
    image: "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "Parent favorite",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-002",
    name: "Head-to-Toe Baby Wash",
    category: "Baby Care",
    sku: "DUCK-BB-WSH-250",
    detail: "Tear-free · 250 ml",
    mrp: 449,
    price: 399,
    costPrice: 160,
    stock: 62,
    reservedStock: 1,
    lowStockThreshold: 15,
    hsnCode: "33049910",
    gstRate: 18,
    image: "https://images.unsplash.com/photo-1686831889344-f8cb3a384bc0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-003",
    name: "Daily Fresh Face Wash",
    category: "Face Wash",
    sku: "DUCK-FW-DFW-150",
    detail: "Aloe + green tea · 150 ml",
    mrp: 399,
    price: 349,
    costPrice: 130,
    stock: 120,
    reservedStock: 4,
    lowStockThreshold: 20,
    hsnCode: "33049910",
    gstRate: 18,
    image: "https://images.unsplash.com/photo-1738892248212-80f7d1f5fc94?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "Bestseller",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-004",
    name: "Hydra Calm Cleanser",
    category: "Face Wash",
    sku: "DUCK-FW-HCC-150",
    detail: "Ceramides · 150 ml",
    mrp: 499,
    price: 429,
    costPrice: 175,
    stock: 8, // Low stock demo!
    reservedStock: 0,
    lowStockThreshold: 10,
    hsnCode: "33049910",
    gstRate: 18,
    image: "https://images.unsplash.com/photo-1625848519294-129bf1cda9f8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "Low Stock",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-005",
    name: "Duck Vapor Comfort Rub",
    category: "Vapor Rub",
    sku: "DUCK-VR-VCR-050",
    detail: "Eucalyptus + mint · 50 g",
    mrp: 299,
    price: 249,
    costPrice: 90,
    stock: 110,
    reservedStock: 3,
    lowStockThreshold: 20,
    hsnCode: "30049011",
    gstRate: 12,
    image: "https://images.unsplash.com/photo-1671493233978-364fd0e59c93?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "Family essential",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-006",
    name: "Junior Vapo Balm",
    category: "Vapor Rub",
    sku: "DUCK-VR-JVB-030",
    detail: "Mild aromatic balm · 30 g",
    mrp: 249,
    price: 199,
    costPrice: 75,
    stock: 55,
    reservedStock: 0,
    lowStockThreshold: 15,
    hsnCode: "30049011",
    gstRate: 12,
    image: "https://images.unsplash.com/photo-1671493234279-57ef0c8f34e6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-007",
    name: "Duck Ortho Pain Oil",
    category: "Ortho Pain Oil",
    sku: "DUCK-OP-OPO-100",
    detail: "12 botanical oils · 100 ml",
    mrp: 599,
    price: 549,
    costPrice: 210,
    stock: 75,
    reservedStock: 2,
    lowStockThreshold: 15,
    hsnCode: "30049011",
    gstRate: 12,
    image: "https://images.unsplash.com/photo-1671493227667-a1c472392c45?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "Herbal formula",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-008",
    name: "Fast Comfort Roll-On",
    category: "Ortho Pain Oil",
    sku: "DUCK-OP-FCR-050",
    detail: "Cooling relief · 50 ml",
    mrp: 349,
    price: 299,
    costPrice: 110,
    stock: 40,
    reservedStock: 0,
    lowStockThreshold: 15,
    hsnCode: "30049011",
    gstRate: 12,
    image: "https://images.unsplash.com/photo-1671493227281-459387acbdc6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-009",
    name: "Featherlight Skin Tint",
    category: "Cosmetics",
    sku: "DUCK-CS-FST-030",
    detail: "12 flexible shades · 30 ml",
    mrp: 799,
    price: 699,
    costPrice: 280,
    stock: 65,
    reservedStock: 1,
    lowStockThreshold: 15,
    hsnCode: "33049910",
    gstRate: 18,
    image: "https://images.unsplash.com/photo-1788693571612-8ed4ba061d0e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "New",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prd-010",
    name: "Soft Glow Essentials",
    category: "Cosmetics",
    sku: "DUCK-CS-SGE-DUO",
    detail: "Blush + balm duo",
    mrp: 899,
    price: 799,
    costPrice: 320,
    stock: 50,
    reservedStock: 1,
    lowStockThreshold: 10,
    hsnCode: "33049910",
    gstRate: 18,
    image: "https://images.unsplash.com/photo-1646905313590-60596e330b2c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
    badge: "Trending",
    status: "Active",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export const initialCustomers: Customer[] = [
  {
    id: "cst-001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "9876543210",
    addresses: [
      {
        fullName: "Aarav Sharma",
        phone: "9876543210",
        addressLine1: "Flat 402, Lotus Residency",
        addressLine2: "Off S.G. Highway, Bodakdev",
        city: "Ahmedabad",
        state: "Gujarat",
        pinCode: "380054",
        country: "India",
      },
    ],
    totalOrders: 3,
    totalSpent: 3195,
    lastOrderDate: "2026-10-15T14:30:00Z",
    status: "VIP",
    internalNotes: "Regular baby care buyer, always prefers UPI payments.",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "cst-002",
    name: "Priya Mukherjee",
    email: "priya.m@example.com",
    phone: "9830012345",
    addresses: [
      {
        fullName: "Priya Mukherjee",
        phone: "9830012345",
        addressLine1: "B-12, Park Street Apartments",
        addressLine2: "Near Camac Street",
        city: "Kolkata",
        state: "West Bengal",
        pinCode: "700016",
        country: "India",
      },
    ],
    totalOrders: 2,
    totalSpent: 1847,
    lastOrderDate: "2026-10-14T11:15:00Z",
    status: "Active",
    createdAt: "2026-02-10T12:00:00Z",
  },
  {
    id: "cst-003",
    name: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "9811098765",
    addresses: [
      {
        fullName: "Vikram Malhotra",
        phone: "9811098765",
        addressLine1: "House 24, Block C, Vasant Vihar",
        city: "New Delhi",
        state: "Delhi",
        pinCode: "110057",
        country: "India",
      },
    ],
    totalOrders: 1,
    totalSpent: 549,
    lastOrderDate: "2026-10-12T09:20:00Z",
    status: "Active",
    createdAt: "2026-03-01T15:30:00Z",
  },
];

export const initialOrders: Order[] = [
  {
    id: "ord-101",
    orderNumber: "DU2026-4821",
    createdAt: "2026-10-15T14:30:00Z",
    updatedAt: "2026-10-16T10:15:00Z",
    customerId: "cst-001",
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "9876543210",
    shippingAddress: {
      fullName: "Aarav Sharma",
      phone: "9876543210",
      addressLine1: "Flat 402, Lotus Residency",
      addressLine2: "Off S.G. Highway, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pinCode: "380054",
      country: "India",
    },
    billingAddress: {
      fullName: "Aarav Sharma",
      phone: "9876543210",
      addressLine1: "Flat 402, Lotus Residency",
      addressLine2: "Off S.G. Highway, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pinCode: "380054",
      country: "India",
    },
    items: [
      {
        productId: "prd-009",
        name: "Featherlight Skin Tint",
        category: "Cosmetics",
        sku: "DUCK-CS-FST-030",
        image: "https://images.unsplash.com/photo-1788693571612-8ed4ba061d0e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
        quantity: 1,
        mrp: 799,
        price: 699,
        discount: 0,
        gstRate: 18,
        taxAmount: 106.63,
        total: 699,
      },
      {
        productId: "prd-007",
        name: "Duck Ortho Pain Oil",
        category: "Ortho Pain Oil",
        sku: "DUCK-OP-OPO-100",
        image: "https://images.unsplash.com/photo-1671493227667-a1c472392c45?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
        quantity: 1,
        mrp: 599,
        price: 549,
        discount: 0,
        gstRate: 12,
        taxAmount: 58.82,
        total: 549,
      },
      {
        productId: "prd-003",
        name: "Daily Fresh Face Wash (Free Gift)",
        category: "Face Wash",
        sku: "DUCK-FW-DFW-150-GIFT",
        image: "https://images.unsplash.com/photo-1738892248212-80f7d1f5fc94?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
        quantity: 1,
        mrp: 399,
        price: 0,
        discount: 0,
        gstRate: 18,
        taxAmount: 0,
        total: 0,
      },
    ],
    subtotal: 1248,
    discountTotal: 0,
    shippingFee: 0,
    taxTotal: 165.45,
    cgst: 82.72,
    sgst: 82.72,
    igst: 0,
    grandTotal: 1248,
    amountPaid: 1248,
    amountDue: 0,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    paymentTransactionRef: "UPI/261015/0981248",
    paymentDate: "2026-10-15T14:32:00Z",
    orderStatus: "Shipped",
    shippingStatus: "In Transit",
    shippingProvider: "Delhivery",
    trackingNumber: "DEL2610158899IN",
    trackingUrl: "https://www.delhivery.com/track/package/DEL2610158899IN",
    shippedAt: "2026-10-16T10:00:00Z",
    assignedStaffId: "stf-005",
    assignedStaffName: "Vikas Chauhan",
    assignedStaffRole: "Shipping Staff",
    taskStatus: "Dispatched via Delhivery Surface",
    customerNotes: "Please deliver before 6 PM.",
    packingNotes: "Includes complimentary Face Wash gift; bubble-wrapped skin tint carefully.",
    internalStaffNotes: "Intra-state delivery within Gujarat, standard 24h TAT expected.",
    invoiceNumber: "DUCK/2026-27/00142",
    timeline: [
      {
        id: "tme-1",
        timestamp: "2026-10-15T14:30:00Z",
        status: "New",
        actor: "Aarav Sharma (Customer)",
        actorRole: "Customer",
        note: "Order placed online via UPI payment.",
      },
      {
        id: "tme-2",
        timestamp: "2026-10-15T14:32:00Z",
        status: "Confirmed",
        actor: "System Gateway",
        actorRole: "System",
        note: "Payment ₹1,248 verified via UPI. Order auto-confirmed.",
      },
      {
        id: "tme-3",
        timestamp: "2026-10-15T16:00:00Z",
        status: "Processing",
        actor: "Rohan Varma",
        actorRole: "Order Processing",
        note: "Order verified, items reserved in warehouse bin B-04.",
      },
      {
        id: "tme-4",
        timestamp: "2026-10-16T08:30:00Z",
        status: "Packing",
        actor: "Karan Dave",
        actorRole: "Packing Staff",
        note: "Packed with bubble wrap and free gift face wash. Packing slip generated.",
      },
      {
        id: "tme-5",
        timestamp: "2026-10-16T10:00:00Z",
        status: "Shipped",
        actor: "Vikas Chauhan",
        actorRole: "Shipping Staff",
        note: "Handed to Delhivery runner. Tracking DEL2610158899IN active.",
      },
    ],
  },
  {
    id: "ord-102",
    orderNumber: "DU2026-4822",
    createdAt: "2026-10-16T09:15:00Z",
    updatedAt: "2026-10-16T11:00:00Z",
    customerId: "cst-002",
    customerName: "Priya Mukherjee",
    customerEmail: "priya.m@example.com",
    customerPhone: "9830012345",
    shippingAddress: {
      fullName: "Priya Mukherjee",
      phone: "9830012345",
      addressLine1: "B-12, Park Street Apartments",
      addressLine2: "Near Camac Street",
      city: "Kolkata",
      state: "West Bengal",
      pinCode: "700016",
      country: "India",
    },
    billingAddress: {
      fullName: "Priya Mukherjee",
      phone: "9830012345",
      addressLine1: "B-12, Park Street Apartments",
      city: "Kolkata",
      state: "West Bengal",
      pinCode: "700016",
      country: "India",
    },
    items: [
      {
        productId: "prd-001",
        name: "Duck Baby Soft Lotion",
        category: "Baby Care",
        sku: "DUCK-BB-LOT-200",
        image: "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
        quantity: 2,
        mrp: 499,
        price: 449,
        discount: 0,
        gstRate: 18,
        taxAmount: 137.0,
        total: 898,
      },
    ],
    subtotal: 898,
    discountTotal: 0,
    shippingFee: 79,
    taxTotal: 137.0,
    cgst: 0,
    sgst: 0,
    igst: 137.0,
    grandTotal: 977,
    amountPaid: 0,
    amountDue: 977,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    orderStatus: "Awaiting Confirmation",
    shippingStatus: "Unfulfilled",
    assignedStaffId: "stf-003",
    assignedStaffName: "Rohan Varma",
    assignedStaffRole: "Order Processing",
    taskStatus: "Pending COD phone verification",
    customerNotes: "Please call before dispatching.",
    internalStaffNotes: "COD order above ₹900. Verification call required as per store policy.",
    invoiceNumber: "DUCK/2026-27/00143",
    timeline: [
      {
        id: "tme-201",
        timestamp: "2026-10-16T09:15:00Z",
        status: "New",
        actor: "Priya Mukherjee (Customer)",
        actorRole: "Customer",
        note: "Order placed via Cash on Delivery.",
      },
      {
        id: "tme-202",
        timestamp: "2026-10-16T09:20:00Z",
        status: "Awaiting Confirmation",
        actor: "System",
        actorRole: "System",
        note: "Moved to Awaiting Confirmation queue for COD verification.",
      },
    ],
  },
  {
    id: "ord-103",
    orderNumber: "DU2026-4820",
    createdAt: "2026-10-14T10:00:00Z",
    updatedAt: "2026-10-16T14:00:00Z",
    customerId: "cst-003",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@example.com",
    customerPhone: "9811098765",
    shippingAddress: {
      fullName: "Vikram Malhotra",
      phone: "9811098765",
      addressLine1: "House 24, Block C, Vasant Vihar",
      city: "New Delhi",
      state: "Delhi",
      pinCode: "110057",
      country: "India",
    },
    billingAddress: {
      fullName: "Vikram Malhotra",
      phone: "9811098765",
      addressLine1: "House 24, Block C, Vasant Vihar",
      city: "New Delhi",
      state: "Delhi",
      pinCode: "110057",
      country: "India",
    },
    items: [
      {
        productId: "prd-007",
        name: "Duck Ortho Pain Oil",
        category: "Ortho Pain Oil",
        sku: "DUCK-OP-OPO-100",
        image: "https://images.unsplash.com/photo-1671493227667-a1c472392c45?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900",
        quantity: 1,
        mrp: 599,
        price: 549,
        discount: 0,
        gstRate: 12,
        taxAmount: 58.82,
        total: 549,
      },
    ],
    subtotal: 549,
    discountTotal: 0,
    shippingFee: 79,
    taxTotal: 58.82,
    cgst: 0,
    sgst: 0,
    igst: 58.82,
    grandTotal: 628,
    amountPaid: 628,
    amountDue: 0,
    paymentMethod: "Card",
    paymentStatus: "Paid",
    paymentTransactionRef: "TXN_CARD_776182",
    paymentDate: "2026-10-14T10:02:00Z",
    orderStatus: "Delivered",
    shippingStatus: "Delivered",
    shippingProvider: "BlueDart",
    trackingNumber: "BLU77889922IN",
    trackingUrl: "https://www.bluedart.com/track?tracking_id=BLU77889922IN",
    shippedAt: "2026-10-14T15:00:00Z",
    deliveredAt: "2026-10-16T13:45:00Z",
    assignedStaffId: "stf-005",
    assignedStaffName: "Vikas Chauhan",
    assignedStaffRole: "Shipping Staff",
    taskStatus: "Delivery confirmed with signature",
    invoiceNumber: "DUCK/2026-27/00141",
    timeline: [
      {
        id: "tme-301",
        timestamp: "2026-10-14T10:00:00Z",
        status: "New",
        actor: "Vikram Malhotra",
        actorRole: "Customer",
        note: "Card checkout complete.",
      },
      {
        id: "tme-302",
        timestamp: "2026-10-14T10:05:00Z",
        status: "Confirmed",
        actor: "System",
        actorRole: "System",
        note: "Card payment confirmed.",
      },
      {
        id: "tme-303",
        timestamp: "2026-10-14T15:00:00Z",
        status: "Shipped",
        actor: "Vikas Chauhan",
        actorRole: "Shipping Staff",
        note: "Dispatched via BlueDart Express.",
      },
      {
        id: "tme-304",
        timestamp: "2026-10-16T13:45:00Z",
        status: "Delivered",
        actor: "BlueDart Webhook",
        actorRole: "Carrier Integration",
        note: "Delivered to security guard / customer.",
      },
    ],
  },
];

export const initialCoupons: Coupon[] = [
  {
    id: "cpn-001",
    code: "DUCK15",
    description: "15% discount on all orders above ₹800",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 800,
    maxDiscount: 300,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    usageLimit: 1000,
    usageCount: 48,
    isActive: true,
  },
  {
    id: "cpn-002",
    code: "WELCOME50",
    description: "Flat ₹50 off on first purchase",
    discountType: "fixed",
    discountValue: 50,
    minOrderValue: 400,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    usageLimit: 500,
    usageCount: 112,
    isActive: true,
  },
  {
    id: "cpn-003",
    code: "FREESHIP",
    description: "Complimentary shipping for any cart",
    discountType: "fixed",
    discountValue: 79,
    minOrderValue: 0,
    validFrom: "2026-01-01T00:00:00Z",
    validUntil: "2026-12-31T23:59:59Z",
    usageLimit: 300,
    usageCount: 77,
    isActive: true,
  },
];

export const initialShipments: Shipment[] = [
  {
    id: "shp-001",
    shipmentNumber: "SHP-2026-00142",
    orderId: "ord-101",
    orderNumber: "DU2026-4821",
    customerName: "Aarav Sharma",
    shippingAddress: {
      fullName: "Aarav Sharma",
      phone: "9876543210",
      addressLine1: "Flat 402, Lotus Residency",
      addressLine2: "Off S.G. Highway, Bodakdev",
      city: "Ahmedabad",
      state: "Gujarat",
      pinCode: "380054",
      country: "India",
    },
    carrier: "Delhivery",
    trackingNumber: "DEL2610158899IN",
    trackingUrl: "https://www.delhivery.com/track/package/DEL2610158899IN",
    packagesCount: 1,
    weightGrams: 420,
    status: "In Transit",
    dispatchedAt: "2026-10-16T10:00:00Z",
    failedAttempts: 0,
  },
  {
    id: "shp-002",
    shipmentNumber: "SHP-2026-00141",
    orderId: "ord-103",
    orderNumber: "DU2026-4820",
    customerName: "Vikram Malhotra",
    shippingAddress: {
      fullName: "Vikram Malhotra",
      phone: "9811098765",
      addressLine1: "House 24, Block C, Vasant Vihar",
      city: "New Delhi",
      state: "Delhi",
      pinCode: "110057",
      country: "India",
    },
    carrier: "BlueDart",
    trackingNumber: "BLU77889922IN",
    trackingUrl: "https://www.bluedart.com/track?tracking_id=BLU77889922IN",
    packagesCount: 1,
    weightGrams: 280,
    status: "Delivered",
    dispatchedAt: "2026-10-14T15:00:00Z",
    deliveredAt: "2026-10-16T13:45:00Z",
    deliveryNotes: "Delivered to security gate, signed by recipient.",
    failedAttempts: 0,
  },
];

export const initialReturns: ReturnRequest[] = [
  {
    id: "ret-001",
    requestNumber: "RET-2026-001",
    orderId: "ord-098",
    orderNumber: "DU2026-4815",
    customerId: "cst-004",
    customerName: "Sunita Kapoor",
    customerEmail: "sunita.k@example.com",
    customerPhone: "9820055443",
    items: [
      {
        productId: "prd-005",
        productName: "Duck Vapor Comfort Rub",
        quantity: 1,
        price: 249,
      },
    ],
    reason: "Damaged on Arrival",
    customerComments: "The cap was cracked inside the outer carton.",
    status: "Approved",
    receivedCondition: "Opened Intact",
    restockingDecision: "Quarantine / Write-off",
    refundAmount: 249,
    refundStatus: "Pending",
    createdAt: "2026-10-15T16:00:00Z",
    updatedAt: "2026-10-16T11:00:00Z",
    processedBy: "Meera Shah",
  },
];

export const initialTransactions: PaymentTransaction[] = [
  {
    id: "txn-001",
    transactionRef: "UPI/261015/0981248",
    orderId: "ord-101",
    orderNumber: "DU2026-4821",
    customerName: "Aarav Sharma",
    method: "UPI",
    type: "Payment",
    amount: 1248,
    status: "Success",
    gatewayResponseId: "pay_upi_9898218124",
    verifiedAt: "2026-10-15T14:32:00Z",
    notes: "Verified via UPI Webhook from Razorpay gateway.",
    recordedBy: "System Gateway",
  },
  {
    id: "txn-002",
    transactionRef: "TXN_CARD_776182",
    orderId: "ord-103",
    orderNumber: "DU2026-4820",
    customerName: "Vikram Malhotra",
    method: "Card",
    type: "Payment",
    amount: 628,
    status: "Success",
    gatewayResponseId: "pay_card_33219412",
    verifiedAt: "2026-10-14T10:02:00Z",
    notes: "Authorized via 3D Secure Visa.",
    recordedBy: "System Gateway",
  },
];

export const initialTickets: SupportTicket[] = [
  {
    id: "tkt-001",
    ticketNumber: "TKT-2026-001",
    customerId: "cst-001",
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "9876543210",
    orderNumber: "DU2026-4821",
    subject: "Delivery timing confirmation request",
    category: "Delivery Delay",
    priority: "Normal",
    status: "In Progress",
    assignedTo: "Ananya Joshi",
    messages: [
      {
        id: "msg-1",
        sender: "Customer",
        senderName: "Aarav Sharma",
        text: "Hi, will the order reach before Friday evening as I need the Baby Lotion for travel?",
        timestamp: "2026-10-15T15:00:00Z",
      },
      {
        id: "msg-2",
        sender: "Support Agent",
        senderName: "Ananya Joshi",
        text: "Hello Aarav! Yes, Delhivery surface is already moving this package within Ahmedabad. You should receive it by Thursday afternoon.",
        timestamp: "2026-10-15T15:30:00Z",
      },
    ],
    internalNotes: "Customer is a loyal VIP, priority assistance granted.",
    createdAt: "2026-10-15T15:00:00Z",
    updatedAt: "2026-10-15T15:30:00Z",
  },
  {
    id: "tkt-002",
    ticketNumber: "TKT-2026-002",
    customerName: "Deepak Rawat",
    customerEmail: "deepak.rawat@example.com",
    customerPhone: "9898033221",
    subject: "Wholesale query for Ortho Pain Oil",
    category: "Wholesale Inquiry",
    priority: "High",
    status: "Open",
    assignedTo: "Pritesh Suthar (Owner)",
    messages: [
      {
        id: "msg-3",
        sender: "Customer",
        senderName: "Deepak Rawat",
        text: "We run a chain of 4 Ayurvedic pharmacies in Surat and are interested in stocking Duck Ortho Pain Oil. Please share trade price list.",
        timestamp: "2026-10-16T12:00:00Z",
      },
    ],
    createdAt: "2026-10-16T12:00:00Z",
    updatedAt: "2026-10-16T12:00:00Z",
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: "sup-001",
    name: "AromaBio Herbals Lab",
    contactPerson: "Dr. Nilesh Trivedi",
    email: "supply@aromabio.in",
    phone: "+91 94260 11223",
    address: "Plot 42, GIDC Estate, Sanand, Ahmedabad, Gujarat – 382110",
    gstin: "24AABCA9876E1Z5",
    suppliedCategories: ["Ortho Pain Oil", "Vapor Rub"],
    paymentTerms: "Net 30 Days",
    status: "Active",
  },
  {
    id: "sup-002",
    name: "PureDerma Formulations",
    contactPerson: "Kavita Singhal",
    email: "kavita@purederma.co.in",
    phone: "+91 98100 44556",
    address: "Baddi Industrial Area, Solan, Himachal Pradesh – 173205",
    gstin: "02AAECP1122D1Z0",
    suppliedCategories: ["Baby Care", "Face Wash", "Cosmetics"],
    paymentTerms: "Net 15 Days",
    status: "Active",
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "PO-2026-008",
    supplierId: "sup-001",
    supplierName: "AromaBio Herbals Lab",
    items: [
      {
        productId: "prd-007",
        productName: "Duck Ortho Pain Oil 100ml",
        sku: "DUCK-OP-OPO-100",
        quantity: 200,
        unitCost: 210,
        totalCost: 42000,
        receivedQuantity: 200,
      },
      {
        productId: "prd-005",
        productName: "Duck Vapor Comfort Rub 50g",
        sku: "DUCK-VR-VCR-050",
        quantity: 150,
        unitCost: 90,
        totalCost: 13500,
        receivedQuantity: 150,
      },
    ],
    totalAmount: 55500,
    status: "Fully Received",
    expectedDelivery: "2026-10-10",
    notes: "Batch #HB-2026-10 with CoA test report received.",
    createdAt: "2026-10-01T10:00:00Z",
    receivedAt: "2026-10-10T16:00:00Z",
  },
];

export const initialNotifications: NotificationLog[] = [
  {
    id: "ntf-001",
    orderId: "ord-101",
    orderNumber: "DU2026-4821",
    recipient: "aarav@example.com / +91 9876543210",
    channel: "WhatsApp",
    type: "Order Shipped",
    subject: "Your Duck order DU2026-4821 is on its way!",
    body: "Hi Aarav, your Duck order is packed and dispatched via Delhivery. Track your package live here: https://www.delhivery.com/track/package/DEL2610158899IN",
    status: "Sent",
    sentAt: "2026-10-16T10:05:00Z",
  },
  {
    id: "ntf-002",
    orderId: "ord-101",
    orderNumber: "DU2026-4821",
    recipient: "aarav@example.com",
    channel: "Email",
    type: "Order Confirmed",
    subject: "Order Confirmation - DU2026-4821 (Duck Cosmetics)",
    body: "Thank you for shopping with Duck Cosmetics! We have received your payment of ₹1,248. View invoice and details in your account.",
    status: "Sent",
    sentAt: "2026-10-15T14:32:00Z",
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "adt-001",
    timestamp: "2026-10-15T14:32:00Z",
    staffId: "stf-001",
    staffName: "System Gateway",
    staffRole: "Owner / Super Admin",
    action: "Order Created & Verified",
    module: "Orders",
    targetId: "ord-101",
    details: "Order DU2026-4821 placed online with UPI transaction ref UPI/261015/0981248.",
  },
  {
    id: "adt-002",
    timestamp: "2026-10-16T10:00:00Z",
    staffId: "stf-005",
    staffName: "Vikas Chauhan",
    staffRole: "Shipping Staff",
    action: "Shipment Manifested & Status Updated to Shipped",
    module: "Shipping",
    targetId: "ord-101",
    details: "Delhivery AWB DEL2610158899IN generated. Package weight: 420g.",
  },
];

class DatabaseEngine {
  private data: DatabaseSchema;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DatabaseSchema;
        if (parsed.version === 1 && parsed.products && parsed.orders) {
          return parsed;
        }
      }
    } catch {
      // In SSR or if localStorage is restricted
    }
    return this.createInitialData();
  }

  private createInitialData(): DatabaseSchema {
    const data: DatabaseSchema = {
      version: 1,
      products: initialProducts,
      orders: initialOrders,
      customers: initialCustomers,
      staff: initialStaff,
      shipments: initialShipments,
      returns: initialReturns,
      transactions: initialTransactions,
      coupons: initialCoupons,
      tickets: initialTickets,
      suppliers: initialSuppliers,
      purchaseOrders: initialPurchaseOrders,
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      settings: initialSettings,
    };
    this.saveToStorage(data);
    return data;
  }

  private saveToStorage(data: DatabaseSchema) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  public notify() {
    this.saveToStorage(this.data);
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Listener error:", err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getRaw(): DatabaseSchema {
    return this.data;
  }

  public resetToFactory(): void {
    this.data = this.createInitialData();
    this.notify();
  }

  // Audit
  public addAuditLog(log: Omit<AuditLog, "id" | "timestamp">) {
    const newLog: AuditLog = {
      ...log,
      id: `adt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.notify();
  }

  // Products
  public getProducts(): ProductItem[] {
    return this.data.products;
  }

  public saveProduct(product: ProductItem, staffName: string, staffRole: any): void {
    const idx = this.data.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.data.products[idx] = { ...product, updatedAt: new Date().toISOString() };
      this.addAuditLog({
        staffId: "stf-active",
        staffName,
        staffRole,
        action: `Updated Product ${product.name}`,
        module: "Products",
        targetId: product.id,
        details: `SKU: ${product.sku}, Stock: ${product.stock}, Price: ₹${product.price}`,
      });
    } else {
      this.data.products.unshift({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.addAuditLog({
        staffId: "stf-active",
        staffName,
        staffRole,
        action: `Created New Product ${product.name}`,
        module: "Products",
        targetId: product.id,
        details: `SKU: ${product.sku}, Category: ${product.category}, Stock: ${product.stock}`,
      });
    }
    this.notify();
  }

  public deleteProduct(id: string, staffName: string, staffRole: any): void {
    const p = this.data.products.find((item) => item.id === id);
    if (p) {
      this.data.products = this.data.products.filter((item) => item.id !== id);
      this.addAuditLog({
        staffId: "stf-active",
        staffName,
        staffRole,
        action: `Archived/Deleted Product ${p.name}`,
        module: "Products",
        targetId: id,
        details: `Removed SKU: ${p.sku}`,
      });
      this.notify();
    }
  }

  // Orders
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public saveOrder(order: Order, staffName = "System", staffRole: any = "System"): void {
    const idx = this.data.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.data.orders[idx] = { ...order, updatedAt: new Date().toISOString() };
    } else {
      this.data.orders.unshift({
        ...order,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.notify();
  }

  // Settings
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public saveSettings(settings: StoreSettings, staffName: string, staffRole: any): void {
    this.data.settings = settings;
    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: "Updated Store & Tax Configuration",
      module: "Settings",
      details: `GSTIN: ${settings.gstin}, Free Shipping Threshold: ₹${settings.freeShippingThreshold}`,
    });
    this.notify();
  }

  // Stock Adjustment
  public adjustStock(
    productId: string,
    change: number,
    reason: any,
    notes: string,
    staffName: string,
    staffRole: any
  ): boolean {
    const p = this.data.products.find((item) => item.id === productId);
    if (!p) return false;

    const prev = p.stock;
    const nextStock = Math.max(0, prev + change);
    p.stock = nextStock;
    p.updatedAt = new Date().toISOString();

    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: `Adjusted Stock for ${p.name}`,
      module: "Inventory",
      targetId: p.id,
      details: `${change >= 0 ? "+" : ""}${change} units. (Prev: ${prev} -> New: ${nextStock}). Reason: ${reason}. Notes: ${notes}`,
    });

    this.notify();
    return true;
  }

  // Notifications
  public getNotifications(): NotificationLog[] {
    return this.data.notifications;
  }

  public addNotification(log: Omit<NotificationLog, "id" | "sentAt">) {
    const ntf: NotificationLog = {
      ...log,
      id: `ntf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sentAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(ntf);
    this.notify();
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public saveCustomer(customer: Customer) {
    const idx = this.data.customers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.data.customers[idx] = customer;
    } else {
      this.data.customers.unshift(customer);
    }
    this.notify();
  }

  // Shipments
  public getShipments(): Shipment[] {
    return this.data.shipments;
  }

  public saveShipment(shipment: Shipment, staffName: string, staffRole: any) {
    const idx = this.data.shipments.findIndex((s) => s.id === shipment.id);
    if (idx >= 0) {
      this.data.shipments[idx] = shipment;
    } else {
      this.data.shipments.unshift(shipment);
    }
    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: `Updated Shipment ${shipment.shipmentNumber}`,
      module: "Shipping",
      targetId: shipment.id,
      details: `Order: ${shipment.orderNumber}, Carrier: ${shipment.carrier}, Tracking: ${shipment.trackingNumber}, Status: ${shipment.status}`,
    });
    this.notify();
  }

  // Returns
  public getReturns(): ReturnRequest[] {
    return this.data.returns;
  }

  public saveReturn(ret: ReturnRequest, staffName: string, staffRole: any) {
    const idx = this.data.returns.findIndex((r) => r.id === ret.id);
    if (idx >= 0) {
      this.data.returns[idx] = { ...ret, updatedAt: new Date().toISOString() };
    } else {
      this.data.returns.unshift({
        ...ret,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: `Updated Return Request ${ret.requestNumber}`,
      module: "Returns & Refunds",
      targetId: ret.id,
      details: `Order: ${ret.orderNumber}, Status: ${ret.status}, Refund: ₹${ret.refundAmount} (${ret.refundStatus})`,
    });
    this.notify();
  }

  // Transactions
  public getTransactions(): PaymentTransaction[] {
    return this.data.transactions;
  }

  public addTransaction(txn: Omit<PaymentTransaction, "id">, staffName: string, staffRole: any) {
    const newTxn: PaymentTransaction = {
      ...txn,
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.data.transactions.unshift(newTxn);
    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: `Recorded Financial Transaction: ${txn.type}`,
      module: "Payments",
      targetId: txn.orderId,
      details: `Ref: ${txn.transactionRef}, Method: ${txn.method}, Amount: ₹${txn.amount}, Status: ${txn.status}`,
    });
    this.notify();
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public saveCoupon(coupon: Coupon, staffName: string, staffRole: any) {
    const idx = this.data.coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      this.data.coupons[idx] = coupon;
    } else {
      this.data.coupons.unshift(coupon);
    }
    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: `Saved Coupon ${coupon.code}`,
      module: "Coupons",
      targetId: coupon.id,
      details: `Discount: ${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : " flat"}, Active: ${coupon.isActive}`,
    });
    this.notify();
  }

  // Support Tickets
  public getTickets(): SupportTicket[] {
    return this.data.tickets;
  }

  public saveTicket(ticket: SupportTicket, staffName: string, staffRole: any) {
    const idx = this.data.tickets.findIndex((t) => t.id === ticket.id);
    if (idx >= 0) {
      this.data.tickets[idx] = { ...ticket, updatedAt: new Date().toISOString() };
    } else {
      this.data.tickets.unshift({
        ...ticket,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.notify();
  }

  // Suppliers & Purchase Orders
  public getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  public saveSupplier(supplier: Supplier, staffName: string, staffRole: any) {
    const idx = this.data.suppliers.findIndex((s) => s.id === supplier.id);
    if (idx >= 0) {
      this.data.suppliers[idx] = supplier;
    } else {
      this.data.suppliers.unshift(supplier);
    }
    this.notify();
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    return this.data.purchaseOrders;
  }

  public savePurchaseOrder(po: PurchaseOrder, staffName: string, staffRole: any) {
    const idx = this.data.purchaseOrders.findIndex((p) => p.id === po.id);
    if (idx >= 0) {
      this.data.purchaseOrders[idx] = po;
    } else {
      this.data.purchaseOrders.unshift(po);
    }
    this.notify();
  }

  // Staff
  public getStaff(): StaffUser[] {
    return this.data.staff;
  }

  public saveStaff(user: StaffUser, staffName: string, staffRole: any) {
    const idx = this.data.staff.findIndex((s) => s.id === user.id);
    if (idx >= 0) {
      if (!user.password || !user.password.trim()) {
        user.password = this.data.staff[idx].password;
      }
      this.data.staff[idx] = user;
    } else {
      this.data.staff.unshift(user);
    }
    this.addAuditLog({
      staffId: "stf-active",
      staffName,
      staffRole,
      action: `Saved Staff Account ${user.name}`,
      module: "Staff & Permissions",
      targetId: user.id,
      details: `Role: ${user.role}, Active: ${user.isActive}`,
    });
    this.notify();
  }

  public updateStaffProfile(staffId: string, updates: { name?: string; phone?: string; password?: string }): StaffUser | null {
    const staff = this.data.staff.find((s) => s.id === staffId);
    if (!staff) return null;
    if (updates.name && updates.name.trim()) staff.name = updates.name.trim();
    if (updates.phone && updates.phone.trim()) staff.phone = updates.phone.trim();
    if (updates.password && updates.password.trim()) staff.password = updates.password.trim();
    this.addAuditLog({
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      action: "Updated Profile & Security Credentials",
      module: "Staff & Permissions",
      targetId: staff.id,
      details: "Staff member updated their personal account credentials",
    });
    this.notify();
    return staff;
  }
}

export const db = new DatabaseEngine();
