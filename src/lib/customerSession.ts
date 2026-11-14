import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbService } from "@/lib/db";

export interface CurrentCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
}

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  try {
    // 1. Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const dbUser = await dbService.findUserByEmail(session.user.email);
      if (dbUser) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || session.user.name || undefined,
          phone: dbUser.phoneNumber || undefined,
          phoneNumber: dbUser.phoneNumber || undefined,
          role: dbUser.role,
        };
      }
      return {
        id: (session.user as any).id || "user-session",
        email: session.user.email,
        name: session.user.name || undefined,
        role: (session.user as any).role || "USER",
      };
    }

    // 2. Check duck_customer_session cookie
    const cookieStore = cookies();
    const customerSessionId = cookieStore.get("duck_customer_session")?.value;
    if (customerSessionId) {
      const dbUser = await dbService.getUserProfile(customerSessionId);
      if (dbUser) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || undefined,
          phone: dbUser.phoneNumber || undefined,
          phoneNumber: dbUser.phoneNumber || undefined,
          role: dbUser.role,
        };
      }
    }
  } catch (error) {
    console.warn("getCurrentCustomer session lookup error:", error);
  }

  return null;
}
