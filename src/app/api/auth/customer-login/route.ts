import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbService } from "@/lib/db";
import { customerLoginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = customerLoginSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid login credentials";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { email, password } = parseResult.data;
    const cleanEmail = email.trim().toLowerCase();

    // Look up user
    const user = await dbService.findUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Incorrect email or password. Please try again or create an account." },
        { status: 401 }
      );
    }

    // Verify bcrypt password hash
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name || "VIP Client"}!`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split("@")[0],
        role: user.role,
      },
    });

    response.cookies.set("duck_customer_session", user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Customer Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during sign in." },
      { status: 500 }
    );
  }
}
