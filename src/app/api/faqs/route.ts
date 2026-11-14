import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const faqs = await dbService.getFaqs(activeOnly);
    return NextResponse.json({ success: true, faqs });
  } catch (error: any) {
    console.error("GET /api/faqs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { question, answer, isActive, order, tags } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Question and Answer are required" },
        { status: 400 }
      );
    }

    const created = await dbService.createFaq({
      question,
      answer,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: order ? Number(order) : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
    });

    return NextResponse.json({ success: true, faq: created });
  } catch (error: any) {
    console.error("POST /api/faqs error:", error);
    return NextResponse.json({ success: false, error: "Failed to create FAQ" }, { status: 500 });
  }
}
