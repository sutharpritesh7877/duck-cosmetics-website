import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pages = await dbService.getAllPages();
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    console.error("Pages GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load pages" },
      { status: 500 }
    );
  }
}
