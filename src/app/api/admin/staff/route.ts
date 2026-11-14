import { NextResponse } from "next/server";
import { z } from "zod";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

const staffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export async function GET() {
  try {
    const staff = await dbService.getStaffList();
    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.error("Staff GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load staff list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = staffSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid staff details";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { name, email, password, role } = parseResult.data;

    const created = await dbService.createStaffMember({
      name: sanitizeText(name),
      email: email.trim().toLowerCase(),
      password,
      role,
    });

    return NextResponse.json({ success: true, staff: created }, { status: 201 });
  } catch (error: any) {
    console.error("Staff POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create staff member" },
      { status: 500 }
    );
  }
}
