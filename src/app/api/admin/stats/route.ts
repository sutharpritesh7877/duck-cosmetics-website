import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await dbService.getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
