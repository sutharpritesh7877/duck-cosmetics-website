import { NextResponse } from "next/server";
import { dbService, ReviewStatus } from "@/lib/db";
import { reviewSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || undefined) as ReviewStatus | undefined;
    const productId = searchParams.get("productId") || undefined;

    const reviews = await dbService.getReviews({
      status: status && status !== ("ALL" as any) ? status : undefined,
      productId,
    });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error("Reviews GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load customer reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = reviewSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid review payload";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { customerName, rating, comment, productId, status } = parseResult.data;

    const created = await dbService.createReview({
      customerName: sanitizeText(customerName),
      rating,
      comment: sanitizeText(comment),
      productId,
      status: (status as ReviewStatus) || "APPROVED",
    });

    return NextResponse.json({ success: true, review: created }, { status: 201 });
  } catch (error: any) {
    console.error("Reviews POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit customer review" },
      { status: 500 }
    );
  }
}
