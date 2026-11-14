import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = String(body.orderId || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Please provide your Order ID (e.g. ORD-1001)." },
        { status: 400 }
      );
    }

    const allOrders = await dbService.getOrders({ limit: 1000 });
    const order = allOrders.orders.find((o) => {
      const matchId =
        o.id.toLowerCase() === orderId.toLowerCase() ||
        o.id.toLowerCase().includes(orderId.toLowerCase()) ||
        orderId.toLowerCase().includes(o.id.toLowerCase());

      if (email && o.email) {
        return matchId && o.email.toLowerCase() === email;
      }
      return matchId;
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "No matching order found. Please check your Order ID and the email address used during checkout.",
        },
        { status: 404 }
      );
    }

    // Determine status stage for visual timeline
    // Stages: 1 = Confirmed, 2 = Packed, 3 = Shipped, 4 = Delivered
    let currentStage = 1;
    if (order.status === "DELIVERED") currentStage = 4;
    else if (order.status === "SHIPPED") currentStage = 3;
    else if (order.status === "PENDING") currentStage = 1;

    const createdDate = new Date(order.createdAt);
    const estDeliveryDate = new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000);

    const timeline = [
      {
        stage: 1,
        title: "Order Placed & Confirmed",
        description: "Your beauty ritual allocation was received and logged in Ahmedabad Atelier.",
        timestamp: createdDate.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        isCompleted: true,
        isActive: currentStage === 1,
      },
      {
        stage: 2,
        title: "Atelier Inspection & Silk Packaging",
        description: "Small-batch formulation passed pharmaceutical QA and was sealed in presentation box.",
        timestamp: new Date(createdDate.getTime() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        isCompleted: currentStage >= 2,
        isActive: currentStage === 2,
      },
      {
        stage: 3,
        title: "Express Carrier Dispatch",
        description: "Package handed over to BlueDart / Delhivery insured courier service.",
        timestamp: new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        isCompleted: currentStage >= 3,
        isActive: currentStage === 3,
      },
      {
        stage: 4,
        title: "Delivered to Doorstep",
        description: "Signature package safely arrived and delivered to recipient.",
        timestamp: `Estimated: ${estDeliveryDate.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })}`,
        isCompleted: currentStage >= 4,
        isActive: currentStage === 4,
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        customerName: order.customerName,
        email: order.email,
        phone: order.phone,
        address: order.address,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        carrier: "BlueDart Express / Delhivery",
        trackingCode: `DK-${order.id.replace(/[^0-9]/g, "").slice(-6) || "948210"}-IN`,
        estimatedDelivery: estDeliveryDate.toLocaleDateString("en-IN", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        items: order.items || [],
        timeline,
      },
    });
  } catch (error: any) {
    console.error("Track Order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to query order tracking details." },
      { status: 500 }
    );
  }
}
