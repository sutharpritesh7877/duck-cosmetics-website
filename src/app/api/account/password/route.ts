import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentCustomer } from "@/lib/customerSession";
import { dbService } from "@/lib/db";
import { passwordChangeSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = passwordChangeSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid password data";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await dbService.getUserProfile(customer.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User account not found" }, { status: 404 });
    }

    // Check if user authenticated via Google OAuth without native password
    if (user.passwordHash === "GOOGLE_OAUTH_AUTHENTICATED") {
      const newHash = await bcrypt.hash(newPassword, 10);
      await dbService.updateUserPassword(customer.id, newHash);
      return NextResponse.json({
        success: true,
        message: "Password set successfully for your Google account.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "The current password entered is incorrect" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await dbService.updateUserPassword(customer.id, newHash);

    return NextResponse.json({
      success: true,
      message: "Your password has been changed securely.",
    });
  } catch (error: any) {
    console.error("Password update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
  }
}
