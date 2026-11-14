import { NextRequest, NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email ? sanitizeText(body.email).toLowerCase() : "";
    const name = body.name ? sanitizeText(body.name) : email.split("@")[0];

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address required from Google account." },
        { status: 400 }
      );
    }

    // Look up or create customer user
    let user = await dbService.findUserByEmail(email);

    if (!user) {
      user = await dbService.createCustomerUser({
        name,
        email,
        passwordHash: "GOOGLE_OAUTH_AUTHENTICATED",
      });
    }

    const customerData = {
      id: user.id,
      email: user.email,
      name: user.name || name,
      role: user.role || "CUSTOMER",
    };

    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${customerData.name}! Successfully authenticated with Google.`,
      user: customerData,
    });

    // Set 30-day customer session cookie
    response.cookies.set("duck_customer_session", user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("OAuth Sync API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to synchronize Google authentication session." },
      { status: 500 }
    );
  }
}
