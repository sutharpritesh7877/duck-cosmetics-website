import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { dbService } from "./db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "duck-cosmetics-super-secret-jwt-key-2026-high-fashion";

const providers: any[] = [
  CredentialsProvider({
    name: "Admin Credentials",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "admin@duckcosmetics.com" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Please enter both email and password");
      }

      const email = credentials.email.trim().toLowerCase();
      const user = await dbService.findAdminByEmail(email);

      if (!user) {
        throw new Error("Invalid admin credentials");
      }

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValid) {
        throw new Error("Invalid admin credentials");
      }

      if (user.role !== "ADMIN" && user.role !== "STAFF") {
        throw new Error("Access restricted to administrative staff");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || "Executive Admin",
        role: user.role,
      };
    },
  }),
];

// Add Google OAuth Provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  secret: JWT_SECRET,
  pages: {
    error: "/?authError=google",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          const existing = await dbService.findUserByEmail(user.email);
          if (!existing) {
            await dbService.createCustomerUser({
              name: user.name || user.email.split("@")[0],
              email: user.email,
              passwordHash: "GOOGLE_OAUTH_AUTHENTICATED",
            });
          }
        } catch (err) {
          console.warn("Google OAuth user sync error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Never elevate customer OAuth to ADMIN; default to CUSTOMER unless explicitly ADMIN/STAFF
        token.role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "CUSTOMER";
      }
      return session;
    },
  },
};

export function createAdminJwt(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminJwt(tokenString: string): { id: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(tokenString, JWT_SECRET) as any;
    if (decoded && (decoded.role === "ADMIN" || decoded.role === "STAFF")) {
      return decoded;
    }
  } catch {
    // invalid token
  }
  return null;
}
