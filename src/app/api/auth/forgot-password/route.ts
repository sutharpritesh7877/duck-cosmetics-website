import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://duckcosmetics.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = forgotPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Please provide a valid email address";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const cleanEmail = parseResult.data.email.trim().toLowerCase();
    const tokenResult = await dbService.createPasswordResetToken(cleanEmail);

    if (tokenResult) {
      const { token, user } = tokenResult;
      const resetUrl = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;
      
      // Send secure reset email asynchronously
      await sendPasswordResetEmail(cleanEmail, resetUrl, user.name);
    }

    // Always respond with a generic success message to prevent user enumeration attacks
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with this email, password reset instructions have been dispatched. The link expires in 15 minutes.",
    });
  } catch (error: any) {
    console.error("Forgot Password API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
