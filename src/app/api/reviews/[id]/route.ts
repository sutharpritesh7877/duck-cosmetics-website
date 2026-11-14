import { NextResponse } from "next/server";
import { dbService, ReviewStatus } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { status, adminReply } = body;

    let updated = null;
    if (status) {
      updated = await dbService.updateReviewStatus(params.id, status as ReviewStatus);
    }
    if (adminReply !== undefined) {
      updated = await dbService.replyToReview(params.id, sanitizeText(adminReply));
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    console.error("Review PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await dbService.deleteReview(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("Review DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}
