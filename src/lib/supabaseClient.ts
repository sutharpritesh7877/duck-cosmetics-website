import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Validates if valid Supabase credentials have been configured in .env or hosting environment.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes("your-project-id") || supabaseAnonKey.includes("your-supabase-anon")) return false;
  try {
    const url = new URL(supabaseUrl);
    return url.hostname.endsWith(".supabase.co") || url.hostname.length > 3;
  } catch {
    return false;
  }
}

/**
 * Returns configuration diagnosis for developer / admin UI.
 */
export function getSupabaseConfigStatus(): {
  configured: boolean;
  url: string;
  hasAnonKey: boolean;
  missingFields: string[];
} {
  const missing: string[] = [];
  if (!supabaseUrl || supabaseUrl.includes("your-project-id")) {
    missing.push("VITE_SUPABASE_URL");
  }
  if (!supabaseAnonKey || supabaseAnonKey.includes("your-supabase-anon")) {
    missing.push("VITE_SUPABASE_ANON_KEY");
  }

  return {
    configured: missing.length === 0,
    url: supabaseUrl ? supabaseUrl.replace(/\/$/, "") : "",
    hasAnonKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes("your-supabase-anon")),
    missingFields: missing,
  };
}

// Log diagnostic for developer clarity (does not leak secret keys)
if (typeof window !== "undefined") {
  const status = getSupabaseConfigStatus();
  if (status.configured) {
    console.info(`[Duck Cosmetics] Connected to Supabase Cloud Database: ${status.url}`);
  } else {
    console.warn(
      `[Duck Cosmetics] Supabase is not yet connected. Missing: ${status.missingFields.join(", ")}. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or Vercel environment variables.`
    );
  }
}

// Initialize Supabase Client
// If credentials are not yet entered, initialize with fallback so client does not crash during build/evaluation
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
