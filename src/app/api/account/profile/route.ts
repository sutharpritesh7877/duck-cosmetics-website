import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customerSession";
import { dbService } from "@/lib/db";
import { profileUpdateSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const profile = await dbService.getUserProfile(customer.id);
    return NextResponse.json({
      success: true,
      profile: {
        id: customer.id,
        name: profile?.name || customer.name || "",
        email: profile?.email || customer.email || "",
        phone: profile?.phoneNumber || customer.phone || "",
        createdAt: profile?.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = profileUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid profile data";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { name, email, phone } = parseResult.data;

    const updated = await dbService.updateUserProfile(customer.id, {
      name: sanitizeText(name),
      email: email.trim().toLowerCase(),
      phoneNumber: phone ? sanitizeText(phone) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phoneNumber || "",
      },
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
