import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbService } from "@/lib/db";
import { siteSettingsSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await dbService.getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load site settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // If payload contains paymentGateways, shippingZones, or globalRouting directly
    if (body.paymentGateways || body.shippingZones || body.globalRouting) {
      if (body.paymentGateways) {
        await dbService.updatePaymentGateways(body.paymentGateways);
      }
      if (body.shippingZones) {
        await dbService.updateShippingZones(body.shippingZones);
      }
      if (body.globalRouting) {
        await dbService.updateGlobalRouting(body.globalRouting);
      }
      const updated = await dbService.getSiteSettings();
      return NextResponse.json({
        success: true,
        message: "Payment, shipping & currency configurations updated successfully",
        settings: updated,
      });
    }

    const parseResult = siteSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid settings payload";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const {
      heroHeadline,
      heroSubheadline,
      heroImageUrl,
      announcementBarText,
      footerTagline,
      trustBadge1,
      trustBadge2,
      maisonHeadline,
      maisonSubheadline,
    } = parseResult.data;

    const updated = await dbService.updateSiteSettings({
      heroHeadline: sanitizeText(heroHeadline),
      heroSubheadline: sanitizeText(heroSubheadline),
      heroImageUrl: heroImageUrl.trim(),
      announcementBarText: sanitizeText(announcementBarText),
      ...(footerTagline ? { footerTagline: sanitizeText(footerTagline) } : {}),
      ...(trustBadge1 ? { trustBadge1: sanitizeText(trustBadge1) } : {}),
      ...(trustBadge2 ? { trustBadge2: sanitizeText(trustBadge2) } : {}),
      ...(maisonHeadline ? { maisonHeadline: sanitizeText(maisonHeadline) } : {}),
      ...(maisonSubheadline ? { maisonSubheadline: sanitizeText(maisonSubheadline) } : {}),
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/cms");
      revalidatePath("/shop");
    } catch (revalErr) {
      console.warn("[Settings PUT] revalidatePath warning:", revalErr);
    }

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully",
      settings: updated,
    });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update site settings" },
      { status: 500 }
    );
  }
}
