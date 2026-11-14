import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customerSession";
import { dbService } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [orders, wishlist, addresses, vipStatus, profile] = await Promise.all([
      dbService.getUserOrders(customer.id, customer.email),
      dbService.getUserWishlist(customer.id),
      dbService.getUserAddresses(customer.id),
      dbService.getVipWaitlistStatus(customer.email, customer.id),
      dbService.getUserProfile(customer.id),
    ]);

    const latestOrder = orders.length > 0 ? orders[0] : null;

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: profile?.name || customer.name || "VIP Connoisseur",
        phone: profile?.phoneNumber || customer.phone || "",
      },
      vipStatus: {
        isVip: true,
        position: vipStatus.position,
        totalWaitlist: vipStatus.totalWaitlist,
        tier: "Atelier Pre-Launch Connoisseur",
      },
      metrics: {
        ordersCount: orders.length,
        wishlistCount: wishlist.length,
        addressesCount: addresses.length,
      },
      latestOrder,
    });
  } catch (error: any) {
    console.error("Account overview GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
