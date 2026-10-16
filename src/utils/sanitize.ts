/**
 * Duck Cosmetics — Security & Input Sanitization Utility
 * Provides protection against XSS (Cross-Site Scripting), HTML injection, and malicious payloads.
 */

export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "") // Strip HTML angle brackets to prevent script tags
    .replace(/javascript:/gi, "") // Prevent pseudo-protocols
    .replace(/on\w+=/gi, ""); // Prevent inline event handlers like onload=, onerror=
}

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  const digitsOnly = phone.replace(/\D/g, "");
  // Indian phone numbers: 10 digits (or 11/12 with 0/91 prefix)
  return digitsOnly.length >= 10 && digitsOnly.length <= 13;
}

export function isValidPinCode(pinCode: unknown): boolean {
  if (typeof pinCode !== "string") return false;
  // 6-digit Indian postal code starting with digits 1-9
  return /^[1-9][0-9]{5}$/.test(pinCode.trim());
}
