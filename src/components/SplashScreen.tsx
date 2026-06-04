import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import schoolLogo from "@/assets/logo.png";

/**
 * Animated splash shown when the PWA opens in standalone mode.
 * Auto-dismisses after ~1.8s (or ~1.0s on low-power devices).
 * On low-power devices or when prefers-reduced-motion is set, renders a
 * lightweight static splash without blurs / orbs / repeating animations
 * so it doesn't freeze entry-level phones.
 */
const SplashScreen = () => {
  const [visible, setVisible] = useState(false);

  // Detect low-power conditions once, synchronously, before render commit.
  const lowPower = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean; effectiveType?: string };
      };
      const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
      const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
      const saveData = !!nav.connection?.saveData;
      const slowNet = nav.connection?.effectiveType === "2g" || nav.connection?.effectiveType === "slow-2g";
      return reducedMotion || lowMem || lowCpu || saveData || slowNet;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const shown = sessionStorage.getItem("mic_splash_shown");
    // Show on PWA standalone OR once per browser session on root/onboarding entry
    const path = window.location.pathname;
    const isEntryRoute = path === "/" || path === "/onboarding";
    if (!shown && (isStandalone || isEntryRoute)) {
      setVisible(true);
      sessionStorage.setItem("mic_splash_shown", "1");
      const duration = isStandalone ? (lowPower ? 2500 : 5000) : (lowPower ? 900 : 1400);
      const t = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(t);
    }
  }, [lowPower]);

  // Lightweight static splash for low-power devices — no blur, no infinite
  // animations, no gradient orbs. Just logo + label + simple progress bar.
  if (visible && lowPower) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
            <img src={schoolLogo} alt="Milestone College" className="w-14 h-14 object-contain" loading="eager" decoding="async" />
          </div>
          <h1 className="mt-5 font-display text-xl text-primary-foreground tracking-wide">
            Milestone <span className="italic text-secondary">Int'l</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary-foreground/60 mt-1">
            College App
          </p>
          <div className="mt-6 w-32 h-0.5 bg-primary-foreground/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full"
              style={{ width: "100%", transition: "width 800ms linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-dark overflow-hidden"
        >
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-secondary/30 blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-accent/30 blur-3xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Logo + label */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 150 }}
              className="relative"
            >
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-secondary"
                animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-secondary"
                animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
              />
              {/* Logo box */}
              <div className="relative w-28 h-28 rounded-3xl bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/20 flex items-center justify-center shadow-glow">
                <img src={schoolLogo} alt="Milestone College" className="w-16 h-16 object-contain" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <h1 className="font-display text-3xl text-primary-foreground tracking-wide">
                Milestone <span className="italic text-secondary">Int'l</span>
              </h1>
              <p className="text-[11px] uppercase tracking-[0.32em] text-primary-foreground/70 mt-1.5">
                College App
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-[10px] text-primary-foreground/45 mt-3 tracking-wider"
              >
                Excellence · Discipline · Innovation
              </motion.p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 w-48 h-1 bg-primary-foreground/15 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-secondary via-secondary-light to-secondary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "easeInOut" }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.7, 0] }}
              transition={{ duration: 4.5, times: [0, 0.1, 0.85, 1] }}
              className="mt-3 text-[10px] uppercase tracking-[0.25em] text-primary-foreground/55"
            >
              Loading your portal…
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
