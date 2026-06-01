import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OfflineBanner = () => {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-[60] bg-destructive text-destructive-foreground text-xs font-medium py-1.5 px-3 flex items-center justify-center gap-2 pt-[calc(env(safe-area-inset-top)+6px)]"
          role="status"
        >
          <WifiOff className="w-3.5 h-3.5" />
          You're offline — showing cached content
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
