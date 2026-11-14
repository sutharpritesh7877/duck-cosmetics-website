import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await dbService.deleteStaffMember(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Staff member deleted" });
  } catch (error: any) {
    console.error("Staff DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete staff member" }, { status: 500 });
  }
}
