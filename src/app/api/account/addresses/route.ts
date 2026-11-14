import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customerSession";
import { dbService } from "@/lib/db";
import { addressSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await dbService.getUserAddresses(customer.id);
    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = addressSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid address details";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const data = parseResult.data;

    const newAddress = await dbService.createAddress(customer.id, {
      name: sanitizeText(data.name),
      phone: sanitizeText(data.phone),
      street1: sanitizeText(data.street1),
      street2: data.street2 ? sanitizeText(data.street2) : undefined,
      city: sanitizeText(data.city),
      state: sanitizeText(data.state),
      zip: sanitizeText(data.zip),
      country: data.country || "India",
      type: data.type,
      isDefault: Boolean(data.isDefault),
    });

    return NextResponse.json({
      success: true,
      message: "Address added to your address book.",
      address: newAddress,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create address" }, { status: 500 });
  }
}
