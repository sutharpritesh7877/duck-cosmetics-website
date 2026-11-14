import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbService } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = resetPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid password reset submission";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { token, email, password } = parseResult.data;
    const cleanEmail = email.trim().toLowerCase();

    // Verify token validity and expiry (15-min TTL)
    const user = await dbService.verifyPasswordResetToken(token);
    if (!user || user.email.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This password reset link is invalid or has expired (15-minute limit). Please request a new link.",
        },
        { status: 400 }
      );
    }

    // Hash the new password with bcrypt (cost factor 10)
    const newPasswordHash = await bcrypt.hash(password, 10);

    const success = await dbService.resetUserPassword(token, newPasswordHash);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reset password. The reset link may have already been consumed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset! You may now sign in with your new credentials.",
    });
  } catch (error: any) {
    console.error("Reset Password API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
