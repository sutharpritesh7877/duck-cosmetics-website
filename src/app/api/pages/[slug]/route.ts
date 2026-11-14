import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const page = await dbService.getPageContent(params.slug);
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error("Page GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve page" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const updated = await dbService.updatePageContent(
      params.slug,
      sanitizeText(title),
      content // Content may contain markdown or formatting
    );

    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    console.error("Page PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update page content" }, { status: 500 });
  }
}
