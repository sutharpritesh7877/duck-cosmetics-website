import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { isActive } = body;

    const updated = await dbService.toggleCoupon(params.id, Boolean(isActive));
    if (!updated) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error("Coupon PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await dbService.deleteCoupon(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("Coupon DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
