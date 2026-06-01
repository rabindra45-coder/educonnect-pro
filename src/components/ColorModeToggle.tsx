import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useColorMode } from "@/hooks/useColorMode";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  className?: string;
}

const ColorModeToggle = ({ className }: Props) => {
  const { mode, toggle } = useColorMode();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={className}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mode === "dark" ? (
          <motion.span
            key="sun"
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 45, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Sun className="w-5 h-5" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -45, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Moon className="w-5 h-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
};

export default ColorModeToggle;
