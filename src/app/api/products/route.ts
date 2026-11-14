import { NextResponse } from "next/server";
import { dbService, ProductStatus } from "@/lib/db";
import { productSchema, sanitizeText } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";
    const bestSellerOnly =
      searchParams.get("bestSeller") === "true" ||
      searchParams.get("isBestSeller") === "true";
    const statusParam = searchParams.get("status") as ProductStatus | null;
    const categoryId = searchParams.get("categoryId") || undefined;
    const categorySlug =
      searchParams.get("categorySlug") ||
      searchParams.get("category") ||
      undefined;
    const subcategorySlug =
      searchParams.get("subcategorySlug") ||
      searchParams.get("subcategory") ||
      undefined;
    const sort = (searchParams.get("sort") as any) || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await dbService.getProducts({
      featuredOnly,
      bestSellerOnly,
      status: statusParam || undefined,
      categoryId,
      categorySlug,
      subcategorySlug,
      sort,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = productSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid product details";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const {
      title,
      description,
      price,
      mrp,
      sellingPrice,
      costPrice,
      stock,
      gst,
      hsn,
      imageUrl,
      backImageUrl,
      textureImageUrl,
      lifestyleImageUrl,
      galleryImages,
      categoryId,
      status,
      isFeatured,
      isBestSeller,
      ingredients,
      directions,
      warnings,
      manufacturer,
      rating,
      reviewCount,
    } = parseResult.data;

    const newProduct = await dbService.createProduct({
      title: sanitizeText(title),
      description: sanitizeText(description),
      price: sellingPrice || price,
      mrp: mrp ?? (sellingPrice || price),
      sellingPrice: sellingPrice ?? price,
      costPrice: costPrice ?? Math.round((sellingPrice || price) * 0.35),
      stock: stock ?? 50,
      gst: gst ?? 18,
      hsn: hsn ? sanitizeText(hsn) : "330499",
      imageUrl: imageUrl.trim(),
      backImageUrl: backImageUrl ? backImageUrl.trim() : undefined,
      textureImageUrl: textureImageUrl ? textureImageUrl.trim() : undefined,
      lifestyleImageUrl: lifestyleImageUrl ? lifestyleImageUrl.trim() : undefined,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      categoryId,
      status,
      isFeatured,
      isBestSeller: Boolean(isBestSeller),
      ingredients: ingredients ? sanitizeText(ingredients) : undefined,
      directions: directions ? sanitizeText(directions) : undefined,
      warnings: warnings ? sanitizeText(warnings) : undefined,
      manufacturer: manufacturer ? sanitizeText(manufacturer) : undefined,
      rating: rating ?? 4.9,
      reviewCount: reviewCount ?? 120,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
