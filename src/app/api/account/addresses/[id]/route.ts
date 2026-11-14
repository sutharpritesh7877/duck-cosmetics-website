import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customerSession";
import { dbService } from "@/lib/db";
import { addressSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = addressSchema.partial().safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid address data";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const data = parseResult.data;
    const updateData: any = {};
    if (data.name) updateData.name = sanitizeText(data.name);
    if (data.phone) updateData.phone = sanitizeText(data.phone);
    if (data.street1) updateData.street1 = sanitizeText(data.street1);
    if (data.street2 !== undefined) updateData.street2 = data.street2 ? sanitizeText(data.street2) : "";
    if (data.city) updateData.city = sanitizeText(data.city);
    if (data.state) updateData.state = sanitizeText(data.state);
    if (data.zip) updateData.zip = sanitizeText(data.zip);
    if (data.country) updateData.country = data.country;
    if (data.type) updateData.type = data.type;
    if (data.isDefault !== undefined) updateData.isDefault = Boolean(data.isDefault);

    const updated = await dbService.updateAddress(params.id, customer.id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Address updated successfully.",
      address: updated,
    });
  } catch (error: any) {
    console.error("Address PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ok = await dbService.setDefaultAddress(params.id, customer.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Default address updated.",
    });
  } catch (error: any) {
    console.error("Address PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to set default address" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const ok = await dbService.deleteAddress(params.id, customer.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Address removed from your address book.",
    });
  } catch (error: any) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
