import { NextResponse } from "next/server";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const promo = await dbService.getMegaMenuPromo();
    return NextResponse.json({ success: true, promo });
  } catch (error: any) {
    console.error("MegaMenuPromo GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load promo card data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const updateData: any = {};

    if (body.badgeText !== undefined) updateData.badgeText = sanitizeText(body.badgeText);
    if (body.title !== undefined) updateData.title = sanitizeText(body.title);
    if (body.description !== undefined) updateData.description = sanitizeText(body.description);
    if (body.posterImageUrl !== undefined) updateData.posterImageUrl = String(body.posterImageUrl).trim();
    if (body.primaryButtonText !== undefined) updateData.primaryButtonText = sanitizeText(body.primaryButtonText);
    if (body.primaryButtonLink !== undefined) updateData.primaryButtonLink = String(body.primaryButtonLink).trim();
    if (body.secondaryButtonText !== undefined) updateData.secondaryButtonText = sanitizeText(body.secondaryButtonText);
    if (body.secondaryButtonLink !== undefined) updateData.secondaryButtonLink = String(body.secondaryButtonLink).trim();
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await dbService.updateMegaMenuPromo(updateData);
    return NextResponse.json({
      success: true,
      message: "Mega-Menu Promo updated successfully",
      promo: updated,
    });
  } catch (error: any) {
    console.error("MegaMenuPromo PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update promo card data" },
      { status: 500 }
    );
  }
}
