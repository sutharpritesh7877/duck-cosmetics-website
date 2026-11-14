import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const waitlist = await dbService.getWaitlist();

    // Generate CSV content
    const header = ["ID", "Email", "Source", "Joined Date (UTC)"].join(",");
    const rows = waitlist.map((entry) => {
      const escapeCsv = (str: string) => `"${(str || "").replace(/"/g, '""')}"`;
      return [
        escapeCsv(entry.id),
        escapeCsv(entry.email),
        escapeCsv(entry.source),
        escapeCsv(new Date(entry.createdAt).toISOString()),
      ].join(",");
    });

    const csvContent = [header, ...rows].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="duck-cosmetics-waitlist-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("CSV Export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export waitlist CSV" },
      { status: 500 }
    );
  }
}
