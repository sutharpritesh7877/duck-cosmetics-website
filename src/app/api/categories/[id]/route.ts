import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbService } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = sanitizeText(body.name).trim();
    if (body.slug !== undefined) updateData.slug = sanitizeText(body.slug).trim();
    if (body.shortDescription !== undefined) updateData.shortDescription = sanitizeText(body.shortDescription).trim();
    if (body.bannerImageUrl !== undefined) updateData.bannerImageUrl = String(body.bannerImageUrl).trim();
    if (body.displayOrder !== undefined) updateData.displayOrder = parseInt(body.displayOrder, 10);
    if (body.parentCategoryId !== undefined) updateData.parentCategoryId = body.parentCategoryId || null;

    if (body.subCategories !== undefined) {
      if (Array.isArray(body.subCategories)) {
        updateData.subCategoriesList = body.subCategories.map((s: string) => sanitizeText(s).trim()).filter(Boolean);
      } else if (typeof body.subCategories === "string") {
        updateData.subCategoriesList = body.subCategories
          .split(",")
          .map((s: string) => sanitizeText(s).trim())
          .filter(Boolean);
      }
    } else if (body.subCategoriesList !== undefined && Array.isArray(body.subCategoriesList)) {
      updateData.subCategoriesList = body.subCategoriesList.map((s: string) => sanitizeText(s).trim()).filter(Boolean);
    }

    const updated = await dbService.updateCategory(params.id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/categories");
    } catch (revalErr) {
      console.warn("[Category PUT] revalidatePath warning:", revalErr);
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error("Category PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ok = await dbService.deleteCategory(params.id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/categories");
    } catch (revalErr) {
      console.warn("[Category DELETE] revalidatePath warning:", revalErr);
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Category DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
