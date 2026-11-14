import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));

    const updated = await dbService.updateFaq(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, faq: updated });
  } catch (error: any) {
    console.error("PUT /api/faqs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const success = await dbService.deleteFaq(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "FAQ deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/faqs/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete FAQ" }, { status: 500 });
  }
}
