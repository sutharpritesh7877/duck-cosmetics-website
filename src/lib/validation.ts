import { z } from "zod";

// --- Validation Schemas ---

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(120, "Email cannot exceed 120 characters"),
  source: z.string().trim().max(150).optional().default("Hero CTA"),
});

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

export const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(2500),
  price: z.coerce.number().min(0).default(0),
  mrp: z.coerce.number().min(0).default(0).optional(),
  sellingPrice: z.coerce.number().min(0).default(0).optional(),
  costPrice: z.coerce.number().min(0).default(0).optional(),
  stock: z.coerce.number().int().min(0).default(50).optional(),
  gst: z.coerce.number().min(0).max(100).default(18).optional(),
  hsn: z.string().trim().default("330499").optional(),
  imageUrl: z
    .string()
    .trim()
    .min(1, "Primary image is required"),
  backImageUrl: z.string().trim().optional().or(z.literal("")),
  textureImageUrl: z.string().trim().optional().or(z.literal("")),
  lifestyleImageUrl: z.string().trim().optional().or(z.literal("")),
  galleryImages: z.array(z.string()).optional(),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "COMING_SOON", "LIVE"]),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false).optional(),
  ingredients: z.string().trim().optional(),
  directions: z.string().trim().optional(),
  warnings: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  rating: z.coerce.number().min(1).max(5).default(4.9).optional(),
  reviewCount: z.coerce.number().min(0).default(120).optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  title: z.string().min(1),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1),
  imageUrl: z.string().optional(),
});

export const orderManualSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name is required"),
  phone: z.string().trim().min(7, "Valid phone number required"),
  email: z.string().trim().email("Valid email required").or(z.literal("")).optional(),
  address: z.string().trim().min(5, "Delivery address is required"),
  city: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  totalAmount: z.coerce.number().min(0),
  paymentMethod: z.string().trim().default("WhatsApp / Manual"),
  notes: z.string().trim().optional(),
  items: z.array(orderItemSchema).min(1, "At least one product item is required"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "RETURNED"]),
});

export const reviewSchema = z.object({
  customerName: z.string().trim().min(2, "Customer name must be at least 2 characters"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Review comment must be at least 5 characters").max(2000),
  productId: z.string().trim().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("APPROVED").optional(),
});

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Coupon code must be at least 2 characters")
    .max(25, "Coupon code cannot exceed 25 characters")
    .transform((val) => val.toUpperCase()),
  discountPercent: z.coerce.number().int().min(1, "Discount must be at least 1%").max(90, "Discount cannot exceed 90%"),
  minOrderAmount: z.coerce.number().min(0, "Minimum order amount cannot be negative").default(0),
  freeGift: z.string().trim().optional(),
});

export const conciergeQASchema = z.object({
  question: z.string().trim().min(3, "Question must be at least 3 characters").max(300),
  answer: z.string().trim().min(5, "Answer must be at least 5 characters").max(3000),
  isActive: z.boolean().default(true).optional(),
  order: z.coerce.number().int().default(0).optional(),
});

export const siteSettingsSchema = z.object({
  heroHeadline: z
    .string()
    .trim()
    .min(3, "Hero headline must be at least 3 characters")
    .max(120),
  heroSubheadline: z
    .string()
    .trim()
    .min(5, "Hero subheadline must be at least 5 characters")
    .max(600),
  heroImageUrl: z
    .string()
    .trim()
    .url("Please enter a valid image URL"),
  announcementBarText: z
    .string()
    .trim()
    .min(3, "Announcement bar text must be at least 3 characters")
    .max(200),
  footerTagline: z.string().trim().optional(),
  trustBadge1: z.string().trim().optional(),
  trustBadge2: z.string().trim().optional(),
  maisonHeadline: z.string().trim().optional(),
  maisonSubheadline: z.string().trim().optional(),
  buttonText: z.string().trim().optional(),
});

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(80),
  email: z.string().trim().email("Please enter a valid email address").max(120),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const customerLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid or missing reset token"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(6, "Valid contact number required").max(20).optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(7, "Valid phone number is required"),
  street1: z.string().trim().min(3, "Address line 1 is required"),
  street2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State / Province is required"),
  zip: z.string().trim().min(3, "Postal / ZIP code is required"),
  country: z.string().trim().default("India"),
  type: z.enum(["SHIPPING", "BILLING"]).default("SHIPPING"),
  isDefault: z.boolean().default(false),
});

export const wishlistToggleSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// --- Sanitization (DOMPurify equivalent for Node/Edge) ---
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[&<>"'/]/g, (match) => {
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      return map[match] || match;
    })
    .trim();
}

// --- Rate Limiting for APIs ---
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { timestamps: [] };

  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitStore.set(ip, { timestamps: validTimestamps });

  if (rateLimitStore.size > 2000) {
    rateLimitStore.forEach((rec, key) => {
      if (rec.timestamps.every((ts) => now - ts > windowMs)) {
        rateLimitStore.delete(key);
      }
    });
  }

  return { allowed: true, remaining: limit - validTimestamps.length };
}
