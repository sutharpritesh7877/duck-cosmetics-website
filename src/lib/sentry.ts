/**
 * Duck Cosmetics Sentry Error Tracking & Diagnostic Telemetry
 * Captures client & server exceptions for real-time triage.
 */

export function captureException(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[Sentry Telemetry Diagnostic]", error, context);
  }

  // If SENTRY_DSN or NEXT_PUBLIC_SENTRY_DSN is configured, dispatch to Sentry
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  if (dsn && typeof window !== "undefined" && (window as any).Sentry) {
    try {
      (window as any).Sentry.captureException(error, { extra: context });
    } catch (e) {
      console.warn("Sentry capture error:", e);
    }
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Sentry Message: ${level}]`, message);
  }
}
