import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MobileBottomNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | boolean;
}

interface MobileBottomNavProps {
  items: MobileBottomNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  accentClass?: string;
}

/**
 * App-like bottom navigation bar for mobile dashboards.
 * Shows up to 5 primary actions; pair with a sidebar on desktop.
 */
const MobileBottomNav = ({
  items,
  activeId,
  onChange,
  accentClass = "bg-primary text-primary-foreground",
}: MobileBottomNavProps) => {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/60 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)]"
      aria-label="Primary navigation"
    >
      <ul className="flex items-stretch justify-around">
        {items.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = item.id === activeId;
          const showBadgeDot = typeof item.badge === "boolean" && item.badge;
          const showBadgeNum = typeof item.badge === "number" && item.badge > 0;
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-full py-2 px-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-8 w-12 rounded-full transition-all",
                    active ? accentClass : "bg-transparent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="truncate max-w-[64px] leading-tight">{item.label}</span>
                {showBadgeNum && (
                  <span className="absolute top-1 right-3 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {item.badge as number}
                  </span>
                )}
                {showBadgeDot && (
                  <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
