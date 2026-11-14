import { NextResponse } from "next/server";
import { dbService, OrderStatus } from "@/lib/db";
import { orderManualSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || undefined) as OrderStatus | undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await dbService.getOrders({
      status: status && status !== ("ALL" as any) ? status : undefined,
      search,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = orderManualSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid order payload";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const {
      customerName,
      phone,
      email,
      address,
      city,
      pincode,
      totalAmount,
      paymentMethod,
      notes,
      items,
    } = parseResult.data;

    const created = await dbService.createManualOrder({
      customerName: sanitizeText(customerName),
      phone: sanitizeText(phone),
      email: email ? sanitizeText(email) : undefined,
      address: sanitizeText(address),
      city: city ? sanitizeText(city) : undefined,
      pincode: pincode ? sanitizeText(pincode) : undefined,
      totalAmount,
      paymentMethod: sanitizeText(paymentMethod),
      notes: notes ? sanitizeText(notes) : undefined,
      items,
    });

    return NextResponse.json({ success: true, order: created }, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create manual order" },
      { status: 500 }
    );
  }
}
