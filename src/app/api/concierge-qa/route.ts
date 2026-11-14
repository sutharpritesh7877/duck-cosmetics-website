import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { conciergeQASchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";
    const activeOnly = !showAll;
    const search = searchParams.get("search") || undefined;

    let qas = await dbService.getConciergeQAs({ activeOnly, search });
    if (!qas || qas.length === 0) {
      const faqs = await dbService.getFaqs(activeOnly);
      if (faqs && faqs.length > 0) {
        qas = faqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          isActive: f.isActive,
          order: f.order,
          tags: f.tags,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt || f.createdAt,
        }));
      }
    }

    return NextResponse.json({
      success: true,
      qas,
      total: qas.length,
    });
  } catch (error: any) {
    console.error("ConciergeQA GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load concierge questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = conciergeQASchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid question details";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { question, answer, isActive, order } = parseResult.data;

    const newQA = await dbService.createConciergeQA({
      question: sanitizeText(question),
      answer: sanitizeText(answer),
      isActive: isActive ?? true,
      order: order ?? 0,
    });

    return NextResponse.json({ success: true, qa: newQA }, { status: 201 });
  } catch (error: any) {
    console.error("ConciergeQA POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create concierge question" },
      { status: 500 }
    );
  }
}
