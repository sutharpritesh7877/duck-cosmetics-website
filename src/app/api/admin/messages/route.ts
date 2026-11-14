import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await dbService.getContactMessages();
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("Messages GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load messages" },
      { status: 500 }
    );
  }
}
