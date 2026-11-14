import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  res.cookies.delete("duck_admin_token");
  res.cookies.delete("next-auth.session-token");
  res.cookies.delete("__Secure-next-auth.session-token");
  return res;
}
