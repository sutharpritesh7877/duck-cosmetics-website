import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbService } from "@/lib/db";
import { customerRegisterSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = customerRegisterSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid registration information";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { name, email, password } = parseResult.data;
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await dbService.findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Cryptographic bcrypt password hashing (cost factor 10)
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await dbService.createCustomerUser({
      name,
      email: cleanEmail,
      passwordHash,
    });

    const response = NextResponse.json({
      success: true,
      message: "VIP Account created successfully! Welcome to Duck Cosmetics.",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });

    // Set customer cookie
    response.cookies.set("duck_customer_session", newUser.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during account creation." },
      { status: 500 }
    );
  }
}
