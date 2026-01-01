import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

  // Session Replay - capture 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    "http://tt.teletrader.info",
    "atomicFindClose",
    // Benign errors
    "ResizeObserver loop",
    "ResizeObserver loop completed with undelivered notifications",
    // Network errors
    "Network request failed",
    "Failed to fetch",
    "NetworkError",
    "Load failed",
    // Hydration (handled gracefully)
    "Hydration failed",
    "hydrating",
    "There was an error while hydrating",
  ],

  // Don't send PII
  sendDefaultPii: false,

  // Environment
  environment: process.env.NODE_ENV,
});
