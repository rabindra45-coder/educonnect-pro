/**
 * Service Worker registration with hard guards:
 *  - Never register inside the Lovable editor iframe (causes stale builds).
 *  - Never register on Lovable preview hosts.
 *  - Auto-unregister legacy SWs in those contexts so old caches die.
 *  - Skip entirely in dev mode.
 */
export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const host = window.location.hostname;
  const isPreviewHost =
    host.includes("id-preview--") ||
    host.includes("lovableproject.com") ||
    host === "localhost" ||
    host === "127.0.0.1";

  if (inIframe || isPreviewHost || import.meta.env.DEV) {
    // Clean up any stale SW registrations in preview / dev.
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    } catch {}
    return;
  }

  try {
    const { registerSW } = await import("virtual:pwa-register");
    registerSW({ immediate: true });
  } catch (e) {
    // virtual module unavailable (e.g. plugin disabled) — silently ignore.
    console.debug("[pwa] register skipped", e);
  }
}
