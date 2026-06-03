import * as Sentry from "@sentry/react";

let initialized = false;

/**
 * Initialize Sentry error & performance monitoring.
 * Requires VITE_SENTRY_DSN env var. Silently no-ops if missing,
 * so the app continues to work without monitoring configured.
 */
export function initMonitoring() {
  if (initialized) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  // Don't run inside Lovable editor iframe/preview hosts
  const host = window.location.hostname;
  const isPreview =
    host.includes("lovableproject.com") || host.includes("id-preview--");
  if (isPreview) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend(event) {
      // Strip potential PII from URLs/query strings
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = "";
          event.request.url = u.toString();
        } catch {}
      }
      return event;
    },
  });

  initialized = true;
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (initialized) {
    Sentry.captureException(error, { extra: context });
  }
  // Always log locally
  // eslint-disable-next-line no-console
  console.error("[app-error]", error, context);
}

export function setMonitoringUser(user: { id: string; role?: string } | null) {
  if (!initialized) return;
  Sentry.setUser(user ? { id: user.id, role: user.role } : null);
}
