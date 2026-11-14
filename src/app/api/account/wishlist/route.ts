import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customerSession";
import { dbService } from "@/lib/db";
import { wishlistToggleSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const items = await dbService.getUserWishlist(customer.id);
    return NextResponse.json({
      success: true,
      wishlist: items,
      total: items.length,
    });
  } catch (error: any) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = wishlistToggleSchema.safeParse(body);

    if (!parseResult.success) {
      const err = parseResult.error.issues?.[0]?.message || "Invalid product ID";
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }

    const { productId } = parseResult.data;
    const result = await dbService.toggleWishlist(customer.id, productId);

    return NextResponse.json({
      success: true,
      inWishlist: result.inWishlist,
      count: result.count,
      message: result.inWishlist
        ? "Formula added to your private wishlist."
        : "Formula removed from your wishlist.",
    });
  } catch (error: any) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 });
  }
}
