import {
  Order,
  OrderItem,
  OrderStatus,
  Address,
  PaymentMethod,
  ShippingProvider,
  StaffUser,
} from "../types";
import { db } from "./db";

export const ORDER_LIFECYCLE_STEPS: OrderStatus[] = [
  "New",
  "Awaiting Confirmation",
  "Confirmed",
  "Processing",
  "Packing",
  "Ready for Dispatch",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  New: ["Awaiting Confirmation", "Confirmed", "Cancelled"],
  "Awaiting Confirmation": ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Packing", "Cancelled"],
  Packing: ["Ready for Dispatch", "Cancelled"],
  "Ready for Dispatch": ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery", "Delivered", "Cancelled"],
  "Out for Delivery": ["Delivered", "Shipped"], // Can retry or mark delivered
  Delivered: ["Return Requested"],
  Cancelled: [],
  "Return Requested": ["Refund Pending", "Cancelled"],
  "Refund Pending": ["Refunded"],
  Refunded: [],
};

export const orderService = {
  createOrder(params: {
    customerId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: Address;
    billingAddress?: Address;
    items: {
      productId: string;
      name: string;
      category: any;
      sku: string;
      image: string;
      quantity: number;
      price: number;
      mrp: number;
      gstRate: number;
    }[];
    paymentMethod: PaymentMethod;
    couponCode?: string;
    discountAmount?: number;
    customerNotes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    const settings = db.getSettings();
    const products = db.getProducts();

    // 1. Free Gift Promotion Server-Side Audit & Abuse Prevention
    const freeGifts = params.items.filter(
      (item) => item.price === 0 || item.sku === "DUCK-FW-DFW-150-GIFT"
    );

    if (freeGifts.length > 0) {
      if (!settings.autoFreeFaceWashOffer) {
        return {
          success: false,
          error: "The complimentary Face Wash promotion is currently inactive.",
        };
      }
      const hasCosmetics = params.items.some(
        (item) => item.category === "Cosmetics" && item.price > 0
      );
      if (!hasCosmetics) {
        return {
          success: false,
          error: "Complimentary gift requires at least one cosmetic item in cart.",
        };
      }
      const totalGiftQty = freeGifts.reduce((sum, item) => sum + item.quantity, 0);
      if (totalGiftQty > 1 || freeGifts.length > 1) {
        return {
          success: false,
          error: "Promotion limit exceeded: strictly 1 complimentary Face Wash allowed per order.",
        };
      }
    }

    // 2. Concurrency and stock check
    for (const item of params.items) {
      const p = products.find(
        (prod) => prod.id === item.productId || prod.name.toLowerCase() === item.name.toLowerCase()
      );
      if (p && p.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name}. Available: ${p.stock}, Requested: ${item.quantity}`,
        };
      }
    }

    // 3. Calculations
    const subtotal = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountTotal = params.discountAmount || 0;
    const discountedSubtotal = Math.max(0, subtotal - discountTotal);
    const shippingFee =
      discountedSubtotal >= settings.freeShippingThreshold || discountedSubtotal === 0
        ? 0
        : settings.standardShippingFee;

    const isIntraState =
      params.shippingAddress.state.trim().toLowerCase() === "gujarat" ||
      params.shippingAddress.state.trim().toLowerCase() === "24";

    let taxTotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const orderItems: OrderItem[] = params.items.map((item) => {
      const lineTotal = item.price * item.quantity;
      const basePrice = lineTotal / (1 + item.gstRate / 100);
      const tax = lineTotal - basePrice;
      taxTotal += tax;
      if (isIntraState) {
        cgst += tax / 2;
        sgst += tax / 2;
      } else {
        igst += tax;
      }
      return {
        ...item,
        discount: 0,
        taxAmount: Number(tax.toFixed(2)),
        total: lineTotal,
      };
    });

    const grandTotal = discountedSubtotal + shippingFee;
    const isCOD = params.paymentMethod === "Cash on Delivery";
    const paymentStatus = isCOD ? "Pending" : "Paid";
    const initialStatus: OrderStatus = isCOD ? "Awaiting Confirmation" : "Confirmed";

    // Deduct stock safely
    params.items.forEach((item) => {
      const p = products.find(
        (prod) => prod.id === item.productId || prod.name.toLowerCase() === item.name.toLowerCase()
      );
      if (p) {
        db.adjustStock(
          p.id,
          -item.quantity,
          "Stock Count Audit",
          `Order placement reservation for ${item.name}`,
          "System Automated Checkout",
          "System"
        );
      }
    });

    const now = new Date();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DU${now.getFullYear()}-${randomSuffix}`;
    const invoiceNumber = `DUCK/${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(-2)}/${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      customerId: params.customerId || `cst-${Date.now()}`,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      shippingAddress: params.shippingAddress,
      billingAddress: params.billingAddress || params.shippingAddress,
      items: orderItems,
      subtotal,
      discountTotal,
      couponCode: params.couponCode,
      shippingFee,
      taxTotal: Number(taxTotal.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      grandTotal,
      amountPaid: isCOD ? 0 : grandTotal,
      amountDue: isCOD ? grandTotal : 0,
      paymentMethod: params.paymentMethod,
      paymentStatus,
      paymentTransactionRef: isCOD ? undefined : `TXN_${Date.now()}_${randomSuffix}`,
      paymentDate: isCOD ? undefined : now.toISOString(),
      orderStatus: initialStatus,
      shippingStatus: "Unfulfilled",
      customerNotes: params.customerNotes,
      invoiceNumber,
      timeline: [
        {
          id: `tme-${Date.now()}-1`,
          timestamp: now.toISOString(),
          status: "New",
          actor: `${params.customerName} (Customer)`,
          actorRole: "Customer",
          note: `Order placed online using ${params.paymentMethod}. Total: ₹${grandTotal.toLocaleString("en-IN")}.`,
        },
        ...(isCOD
          ? [
              {
                id: `tme-${Date.now()}-2`,
                timestamp: now.toISOString(),
                status: "Awaiting Confirmation" as OrderStatus,
                actor: "System Gateway",
                actorRole: "System",
                note: "Cash on delivery order queued for phone/SMS verification.",
              },
            ]
          : [
              {
                id: `tme-${Date.now()}-2`,
                timestamp: now.toISOString(),
                status: "Confirmed" as OrderStatus,
                actor: "Payment Gateway",
                actorRole: "Gateway",
                note: `Online payment of ₹${grandTotal.toLocaleString("en-IN")} verified. Order confirmed.`,
              },
            ]),
      ],
    };

    db.saveOrder(newOrder);

    // Save transaction record if paid
    if (!isCOD) {
      db.addTransaction(
        {
          transactionRef: newOrder.paymentTransactionRef!,
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          customerName: newOrder.customerName,
          method: newOrder.paymentMethod,
          type: "Payment",
          amount: grandTotal,
          status: "Success",
          verifiedAt: now.toISOString(),
          notes: `Online checkout transaction via ${params.paymentMethod}`,
          recordedBy: "Payment Gateway Integration",
        },
        "System Automated Gateway",
        "System"
      );
    }

    // Trigger Notification
    db.addNotification({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      recipient: `${params.customerEmail} / ${params.customerPhone}`,
      channel: "WhatsApp",
      type: "Order Placed",
      subject: `Your Duck Order ${orderNumber} is Received!`,
      body: `Hello ${params.customerName}, thank you for choosing Duck Cosmetics. Your order for ${params.items.length} item(s) totalling ₹${grandTotal} is received. Tracking will be shared as soon as it ships.`,
      status: "Sent",
    });

    db.addAuditLog({
      staffId: "stf-sys",
      staffName: "Customer Checkout",
      staffRole: "Customer Support",
      action: `Order ${orderNumber} Created`,
      module: "Orders",
      targetId: newOrder.id,
      details: `Items: ${orderItems.length}, Total: ₹${grandTotal}, Method: ${params.paymentMethod}, Status: ${initialStatus}`,
    });

    return { success: true, order: newOrder };
  },

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    staff: StaffUser,
    note?: string,
    reason?: string
  ): { success: boolean; error?: string } {
    const order = db.getOrderById(orderId);
    if (!order) return { success: false, error: "Order not found." };

    const oldStatus = order.orderStatus;
    if (oldStatus === newStatus) return { success: true };

    const allowed = ALLOWED_TRANSITIONS[oldStatus] || [];
    // Allow owner or manager to override, but normal staff must follow lifecycle
    const isOverrideAllowed = staff.role === "Owner / Super Admin" || staff.role === "Admin Manager";
    if (!allowed.includes(newStatus) && !isOverrideAllowed) {
      return {
        success: false,
        error: `Invalid transition from "${oldStatus}" to "${newStatus}". Allowed: ${allowed.join(", ") || "None"}`,
      };
    }

    const now = new Date().toISOString();

    // If cancelling, restore inventory!
    if (newStatus === "Cancelled") {
      order.items.forEach((item) => {
        db.adjustStock(
          item.productId,
          item.quantity,
          "Correction",
          `Restocking due to order cancellation of ${order.orderNumber}. Reason: ${reason || "Customer/Staff cancellation"}`,
          staff.name,
          staff.role
        );
      });
      order.taskStatus = "Order cancelled and items restocked";
    }

    // Update fulfillment shipping status mappings
    if (newStatus === "Packing") {
      order.shippingStatus = "Packed";
    } else if (newStatus === "Ready for Dispatch") {
      order.shippingStatus = "Manifested";
    } else if (newStatus === "Shipped") {
      order.shippingStatus = "In Transit";
      order.shippedAt = now;
    } else if (newStatus === "Out for Delivery") {
      order.shippingStatus = "Out for Delivery";
    } else if (newStatus === "Delivered") {
      order.shippingStatus = "Delivered";
      order.deliveredAt = now;
      if (order.paymentMethod === "Cash on Delivery" && order.paymentStatus !== "Paid") {
        // Record COD collected
        order.paymentStatus = "Paid";
        order.amountPaid = order.grandTotal;
        order.amountDue = 0;
        db.addTransaction(
          {
            transactionRef: `COD_COLLECT_${order.orderNumber}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            method: "Cash on Delivery",
            type: "COD Collection",
            amount: order.grandTotal,
            status: "Success",
            verifiedAt: now,
            notes: "COD amount collected on delivery by courier agent.",
            recordedBy: staff.name,
          },
          staff.name,
          staff.role
        );
      }
    }

    order.orderStatus = newStatus;
    order.updatedAt = now;

    const timelineEvent = {
      id: `tme-${Date.now()}`,
      timestamp: now,
      status: newStatus,
      actor: staff.name,
      actorRole: staff.role,
      note: note || `Status updated from ${oldStatus} to ${newStatus}.${reason ? ` Reason: ${reason}` : ""}`,
    };

    order.timeline.push(timelineEvent);
    db.saveOrder(order, staff.name, staff.role);

    // Notifications
    const channel = "WhatsApp";
    if (newStatus === "Shipped") {
      db.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipient: `${order.customerEmail} / ${order.customerPhone}`,
        channel,
        type: "Order Shipped",
        subject: `Your Duck Order ${order.orderNumber} is Shipped!`,
        body: `Hi ${order.customerName}, your Duck cosmetics package has been dispatched via ${order.shippingProvider || "Courier"}. Tracking number: ${order.trackingNumber || "Pending"}. Track online here: ${order.trackingUrl || "#"}`,
        status: "Sent",
      });
    } else if (newStatus === "Delivered") {
      db.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipient: `${order.customerEmail} / ${order.customerPhone}`,
        channel,
        type: "Order Delivered",
        subject: `Order ${order.orderNumber} Delivered - Duck Cosmetics`,
        body: `Hi ${order.customerName}, your order ${order.orderNumber} has been delivered. We hope you and your family love our gentle formulas!`,
        status: "Sent",
      });
    } else if (newStatus === "Cancelled") {
      db.addNotification({
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipient: `${order.customerEmail} / ${order.customerPhone}`,
        channel: "Email",
        type: "Order Cancelled",
        subject: `Order Cancellation Confirmed - ${order.orderNumber}`,
        body: `Hello ${order.customerName}, order ${order.orderNumber} has been cancelled as requested. Any applicable refund will be processed within 3-5 business days.`,
        status: "Sent",
      });
    }

    db.addAuditLog({
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role,
      action: `Order ${order.orderNumber} Status Changed: ${oldStatus} -> ${newStatus}`,
      module: "Orders",
      targetId: order.id,
      details: note || reason || `Transitioned by ${staff.name}`,
    });

    return { success: true };
  },

  assignStaff(orderId: string, assignedStaff: StaffUser, actingStaff: StaffUser, taskNote?: string) {
    const order = db.getOrderById(orderId);
    if (!order) return;

    order.assignedStaffId = assignedStaff.id;
    order.assignedStaffName = assignedStaff.name;
    order.assignedStaffRole = assignedStaff.role;
    order.taskStatus = taskNote || `Assigned to ${assignedStaff.name} (${assignedStaff.role})`;
    order.updatedAt = new Date().toISOString();

    order.timeline.push({
      id: `tme-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: order.orderStatus,
      actor: actingStaff.name,
      actorRole: actingStaff.role,
      note: `Task assigned to ${assignedStaff.name} (${assignedStaff.role}). Note: ${taskNote || "Follow up processing"}`,
    });

    db.saveOrder(order, actingStaff.name, actingStaff.role);

    db.addAuditLog({
      staffId: actingStaff.id,
      staffName: actingStaff.name,
      staffRole: actingStaff.role,
      action: `Assigned Order ${order.orderNumber} to ${assignedStaff.name}`,
      module: "Staff Assignment",
      targetId: order.id,
      details: `Role: ${assignedStaff.role}, Note: ${taskNote || "None"}`,
    });
  },

  updateShippingDetails(
    orderId: string,
    provider: ShippingProvider,
    trackingNumber: string,
    trackingUrl: string,
    actingStaff: StaffUser
  ) {
    const order = db.getOrderById(orderId);
    if (!order) return;

    order.shippingProvider = provider;
    order.trackingNumber = trackingNumber;
    order.trackingUrl = trackingUrl;
    order.updatedAt = new Date().toISOString();

    order.timeline.push({
      id: `tme-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: order.orderStatus,
      actor: actingStaff.name,
      actorRole: actingStaff.role,
      note: `Shipping details updated: Carrier ${provider}, Tracking ${trackingNumber}`,
    });

    db.saveOrder(order, actingStaff.name, actingStaff.role);

    // Also update or create matching shipment entity
    const existingShipment = db.getShipments().find((s) => s.orderId === orderId);
    if (existingShipment) {
      existingShipment.carrier = provider;
      existingShipment.trackingNumber = trackingNumber;
      existingShipment.trackingUrl = trackingUrl;
      db.saveShipment(existingShipment, actingStaff.name, actingStaff.role);
    } else {
      db.saveShipment(
        {
          id: `shp-${Date.now()}`,
          shipmentNumber: `SHP-${new Date().getFullYear()}-${order.orderNumber.replace(/[^\d]/g, "")}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          shippingAddress: order.shippingAddress,
          carrier: provider,
          trackingNumber,
          trackingUrl,
          packagesCount: 1,
          weightGrams: 350,
          status: "In Transit",
          dispatchedAt: new Date().toISOString(),
          failedAttempts: 0,
        },
        actingStaff.name,
        actingStaff.role
      );
    }
  },

  addInternalNote(orderId: string, noteText: string, actingStaff: StaffUser) {
    const order = db.getOrderById(orderId);
    if (!order) return;

    const prefix = order.internalStaffNotes ? `${order.internalStaffNotes}\n---\n` : "";
    const stamp = `[${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} by ${actingStaff.name}]: `;
    order.internalStaffNotes = `${prefix}${stamp}${noteText}`;
    order.updatedAt = new Date().toISOString();

    db.saveOrder(order, actingStaff.name, actingStaff.role);
  },
};
