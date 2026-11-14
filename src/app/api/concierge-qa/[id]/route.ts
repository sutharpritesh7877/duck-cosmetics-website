import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const updateData: {
      question?: string;
      answer?: string;
      isActive?: boolean;
      order?: number;
    } = {};

    if (body.question !== undefined) updateData.question = sanitizeText(body.question);
    if (body.answer !== undefined) updateData.answer = sanitizeText(body.answer);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.order !== undefined) updateData.order = parseInt(body.order, 10);

    const updated = await dbService.updateConciergeQA(params.id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Concierge Q&A not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, qa: updated });
  } catch (error: any) {
    console.error("ConciergeQA PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update concierge question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await dbService.deleteConciergeQA(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Concierge Q&A not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Concierge question deleted successfully" });
  } catch (error: any) {
    console.error("ConciergeQA DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete concierge question" },
      { status: 500 }
    );
  }
}
