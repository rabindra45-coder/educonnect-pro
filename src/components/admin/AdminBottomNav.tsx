import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, GraduationCap, UserCheck, Wallet, Menu, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  path: string;
  label: string;
  icon: LucideIcon;
  match?: (p: string) => boolean;
}

interface AdminBottomNavProps {
  onMenuOpen?: () => void;
}

/**
 * Mobile bottom navigation for the admin layout.
 * Shows 4 most-used destinations plus a Menu button that opens the full sidebar.
 */
const AdminBottomNav = ({ onMenuOpen }: AdminBottomNavProps) => {
  const { pathname } = useLocation();

  const items: Item[] = [
    { path: "/admin", label: "Home", icon: LayoutDashboard, match: (p) => p === "/admin" },
    { path: "/admin/students", label: "Students", icon: GraduationCap },
    { path: "/admin/attendance", label: "Attend", icon: UserCheck },
    { path: "/admin/fees", label: "Fees", icon: Wallet },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/60 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)]"
      aria-label="Primary navigation"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active = item.match ? item.match(pathname) : pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <Link
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-full py-2 px-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-8 w-12 rounded-full transition-all",
                    active ? "bg-primary text-primary-foreground" : "bg-transparent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="truncate max-w-[64px] leading-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMenuOpen}
            className="relative flex flex-col items-center justify-center gap-0.5 w-full py-2 px-1 text-[10px] font-medium text-muted-foreground"
          >
            <span className="flex items-center justify-center h-8 w-12 rounded-full">
              <Menu className="w-5 h-5" />
            </span>
            <span className="leading-tight">More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminBottomNav;
