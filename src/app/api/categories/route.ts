import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await dbService.getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = body.name ? sanitizeText(body.name).trim() : "";
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    let subCategoriesList: string[] = [];
    if (Array.isArray(body.subCategories)) {
      subCategoriesList = body.subCategories.map((s: string) => sanitizeText(s).trim()).filter(Boolean);
    } else if (typeof body.subCategories === "string") {
      subCategoriesList = body.subCategories
        .split(",")
        .map((s: string) => sanitizeText(s).trim())
        .filter(Boolean);
    } else if (Array.isArray(body.subCategoriesList)) {
      subCategoriesList = body.subCategoriesList.map((s: string) => sanitizeText(s).trim()).filter(Boolean);
    }

    const created = await dbService.createCategory({
      name,
      slug: body.slug ? sanitizeText(body.slug).trim() : undefined,
      shortDescription: body.shortDescription ? sanitizeText(body.shortDescription).trim() : undefined,
      bannerImageUrl: body.bannerImageUrl ? String(body.bannerImageUrl).trim() : undefined,
      subCategoriesList,
      displayOrder: body.displayOrder !== undefined ? parseInt(body.displayOrder, 10) : 99,
      parentCategoryId: body.parentCategoryId || null,
    });

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/categories");
    } catch (revalErr) {
      console.warn("[Categories POST] revalidatePath warning:", revalErr);
    }

    return NextResponse.json({ success: true, category: created }, { status: 201 });
  } catch (error: any) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
