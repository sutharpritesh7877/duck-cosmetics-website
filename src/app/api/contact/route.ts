import { NextResponse } from "next/server";
import { z } from "zod";
import { dbService } from "@/lib/db";
import { checkRateLimit, sanitizeText } from "@/lib/validation";
import {
  sendContactAutoresponderEmail,
  sendAdminContactNotification,
} from "@/lib/email";

const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters"),
});

export async function POST(request: Request) {
  try {
    // 1. IP extraction & rate limiting (max 3 requests per IP per minute)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { allowed } = checkRateLimit(ip, 3, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please wait a minute before sending another message.",
        },
        { status: 429 }
      );
    }

    // 2. Parse body & validate with Zod
    const body = await request.json().catch(() => ({}));
    const parseResult = contactMessageSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues?.[0]?.message || "Invalid contact form details";
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

    // 3. Sanitize inputs
    const { name, email, phone, message } = parseResult.data;
    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeText(email).toLowerCase();
    const cleanPhone = phone ? sanitizeText(phone) : undefined;
    const cleanMessage = sanitizeText(message);

    // 4. Save to Database
    const saved = await dbService.createContactMessage({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
    });

    // 5. Trigger automated customer auto-responder & admin notification
    sendContactAutoresponderEmail(cleanEmail, cleanName, cleanMessage).catch((err) =>
      console.warn("[Contact] Customer auto-responder error:", err)
    );
    sendAdminContactNotification({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: cleanMessage,
    }).catch((err) =>
      console.warn("[Contact] Admin notification error:", err)
    );

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out to Duck Cosmetics. Our concierge team has received your message.",
        data: saved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while delivering your message. Please try again." },
      { status: 500 }
    );
  }
}
