import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { dbService, ProductStatus } from "@/lib/db";
import { sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await dbService.getProductById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Product GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = sanitizeText(body.title);
    if (body.description !== undefined) updateData.description = sanitizeText(body.description);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.mrp !== undefined) updateData.mrp = Number(body.mrp);
    if (body.sellingPrice !== undefined) updateData.sellingPrice = Number(body.sellingPrice);
    if (body.costPrice !== undefined) updateData.costPrice = Number(body.costPrice);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock, 10);
    if (body.gst !== undefined) updateData.gst = Number(body.gst);
    if (body.hsn !== undefined) updateData.hsn = sanitizeText(body.hsn);
    if (body.imageUrl !== undefined) updateData.imageUrl = String(body.imageUrl).trim();
    if (body.backImageUrl !== undefined) updateData.backImageUrl = String(body.backImageUrl).trim() || undefined;
    if (body.textureImageUrl !== undefined) updateData.textureImageUrl = String(body.textureImageUrl).trim() || undefined;
    if (body.lifestyleImageUrl !== undefined) updateData.lifestyleImageUrl = String(body.lifestyleImageUrl).trim() || undefined;
    if (body.galleryImages !== undefined) updateData.galleryImages = Array.isArray(body.galleryImages) ? body.galleryImages : [];
    if (body.categoryId !== undefined) updateData.categoryId = String(body.categoryId);
    if (body.status !== undefined) updateData.status = body.status as ProductStatus;
    if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
    if (body.isBestSeller !== undefined) updateData.isBestSeller = Boolean(body.isBestSeller);
    if (body.ingredients !== undefined) updateData.ingredients = sanitizeText(body.ingredients);
    if (body.directions !== undefined) updateData.directions = sanitizeText(body.directions);
    if (body.warnings !== undefined) updateData.warnings = sanitizeText(body.warnings);
    if (body.manufacturer !== undefined) updateData.manufacturer = sanitizeText(body.manufacturer);
    if (body.rating !== undefined) updateData.rating = Number(body.rating);
    if (body.reviewCount !== undefined) updateData.reviewCount = Number(body.reviewCount);

    const updated = await dbService.updateProduct(params.id, updateData);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/best-sellers");
      revalidatePath("/new-arrivals");
      revalidatePath(`/product/${params.id}`);
      revalidatePath("/admin/products");
    } catch (revalErr) {
      console.warn("[Product PUT] revalidatePath warning:", revalErr);
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await dbService.deleteProduct(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/best-sellers");
      revalidatePath("/new-arrivals");
      revalidatePath(`/product/${params.id}`);
      revalidatePath("/admin/products");
    } catch (revalErr) {
      console.warn("[Product DELETE] revalidatePath warning:", revalErr);
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
