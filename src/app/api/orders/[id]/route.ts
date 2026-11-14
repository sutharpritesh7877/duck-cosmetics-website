import { NextResponse } from "next/server";
import { dbService, OrderStatus } from "@/lib/db";
import { orderStatusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await dbService.getOrderById(params.id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve order" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = orderStatusSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid order status";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const updated = await dbService.updateOrderStatus(params.id, parseResult.data.status as OrderStatus);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Order PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 });
  }
}
