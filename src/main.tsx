import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerSW";
import { initMonitoring, reportError } from "./lib/monitoring";

// Initialise error/performance monitoring before render.
initMonitoring();

// Last-resort global handlers so nothing slips through unreported.
window.addEventListener("error", (e) => reportError(e.error ?? e.message));
window.addEventListener("unhandledrejection", (e) => reportError(e.reason));

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA service worker (no-op in preview/iframe/dev).
registerServiceWorker();
