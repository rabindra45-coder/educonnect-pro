import { useEffect, useRef, useState } from "react";

interface Options {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  /** Only activate when window is scrolled to top. */
  topOnly?: boolean;
}

/**
 * Tiny pull-to-refresh hook for mobile webviews / PWA standalone mode.
 * Returns translate distance + refreshing flag so a caller can render the indicator.
 */
export function usePullToRefresh({ onRefresh, threshold = 70, topOnly = true }: Options) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (topOnly && window.scrollY > 4) return;
      startY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY <= 0) {
        const damp = Math.min(120, dy * 0.5);
        setPull(damp);
      }
    };
    const onTouchEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pull >= threshold && !refreshing) {
        setRefreshing(true);
        try { await onRefresh(); } finally {
          setTimeout(() => { setRefreshing(false); setPull(0); }, 300);
        }
      } else {
        setPull(0);
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pull, threshold, refreshing, topOnly]);

  return { pull, refreshing };
}
