import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contact = await dbService.getContactSettings();
    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    console.error("Contact settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve contact settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone1, phone2, phone3, email, address, bottomText } = body;

    const updated = await dbService.updateContactSettings({
      ...(phone1 ? { phone1: sanitizeText(phone1) } : {}),
      ...(phone2 ? { phone2: sanitizeText(phone2) } : {}),
      ...(phone3 ? { phone3: sanitizeText(phone3) } : {}),
      ...(email ? { email: sanitizeText(email) } : {}),
      ...(address ? { address: sanitizeText(address) } : {}),
      ...(bottomText ? { bottomText: sanitizeText(bottomText) } : {}),
    });

    return NextResponse.json({ success: true, contact: updated });
  } catch (error: any) {
    console.error("Contact settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update contact settings" },
      { status: 500 }
    );
  }
}
