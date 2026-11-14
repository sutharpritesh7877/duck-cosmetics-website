import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { waitlistSchema, sanitizeText, checkRateLimit } from "@/lib/validation";
import { sendWaitlistWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    // 1. IP extraction & rate limiting (max 3 requests per IP per minute)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { allowed, remaining } = checkRateLimit(ip, 3, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait a moment before trying again.",
          rateLimited: true,
        },
        {
          status: 429,
          headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
        }
      );
    }

    // 2. Parse body & validate with Zod
    const body = await request.json().catch(() => ({}));
    const parseResult = waitlistSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues?.[0]?.message || "Invalid email address";
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

    // 3. Sanitize inputs
    const cleanEmail = sanitizeText(parseResult.data.email).toLowerCase();
    const cleanSource = sanitizeText(parseResult.data.source) || "Hero CTA";

    // 4. Save to Database
    const result = await dbService.addToWaitlist({
      email: cleanEmail,
      source: cleanSource,
    });

    // 5. Trigger automated VIP Welcome Email
    if (result.isNew) {
      sendWaitlistWelcomeEmail(cleanEmail, cleanSource).catch((err) =>
        console.warn("[Waitlist] Automated welcome email error:", err)
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.isNew ? "You're on the list! We'll notify you the moment we launch." : "You are already on the VIP waitlist!",
        isNew: result.isNew,
        entry: result.entry,
        remaining,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const list = await dbService.getWaitlist();
    return NextResponse.json({ success: true, count: list.length, waitlist: list });
  } catch (error: any) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve waitlist" },
      { status: 500 }
    );
  }
}
