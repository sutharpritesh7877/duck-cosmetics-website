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

    // If payload contains contact details / address updates, synchronize to contactSettings
    if (body.address || body.email || body.phone1 || body.supportEmail || body.supportPhone1) {
      try {
        await dbService.updateContactSettings({
          ...(body.address ? { address: sanitizeText(body.address) } : {}),
          ...(body.email || body.supportEmail ? { email: sanitizeText(body.email || body.supportEmail) } : {}),
          ...(body.phone1 || body.supportPhone1 ? { phone1: sanitizeText(body.phone1 || body.supportPhone1) } : {}),
          ...(body.phone2 || body.supportPhone2 ? { phone2: sanitizeText(body.phone2 || body.supportPhone2) } : {}),
          ...(body.phone3 || body.supportPhone3 ? { phone3: sanitizeText(body.phone3 || body.supportPhone3) } : {}),
        });
      } catch (cErr) {
        console.warn("[Settings PUT] updateContactSettings warning:", cErr);
      }
    }

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
      revalidatePath("/contact");
      revalidatePath("/admin/cms");
      revalidatePath("/admin/contact");
      revalidatePath("/admin/settings");
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
