import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbService } from "@/lib/db";
import { createAdminJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const adminUser = await dbService.findAdminByEmail(cleanEmail);

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(String(password), adminUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    const token = createAdminJwt({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name || "Executive Admin",
        role: adminUser.role,
      },
    });

    // Set HTTP-only cookie for middleware protection
    res.cookies.set("duck_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server authentication error" },
      { status: 500 }
    );
  }
}
