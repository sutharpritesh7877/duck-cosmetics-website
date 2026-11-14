import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { couponSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await dbService.getCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error("Coupons GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = couponSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid coupon details";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { code, discountPercent, minOrderAmount, freeGift } = parseResult.data;

    const created = await dbService.createCoupon({
      code,
      discountPercent,
      minOrderAmount,
      freeGift: freeGift ? sanitizeText(freeGift) : undefined,
    });

    return NextResponse.json({ success: true, coupon: created }, { status: 201 });
  } catch (error: any) {
    console.error("Coupons POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create promotion coupon" },
      { status: 500 }
    );
  }
}
