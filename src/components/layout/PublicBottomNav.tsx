import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Bell, LayoutGrid, User, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "home", path: "/", label: "Home", icon: Home },
  { id: "search", path: "#search", label: "Search", icon: Search },
  { id: "fab", path: "#fab", label: "", icon: Plus, fab: true },
  { id: "notifications", path: "/notices", label: "Alerts", icon: Bell },
  { id: "services", path: "#services", label: "Services", icon: LayoutGrid },
] as const;

/**
 * Native-app-style bottom navigation bar shown on public pages (mobile only).
 * Center FAB opens quick contact / admission. Search & Services open sheets.
 */
const PublicBottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [query, setQuery] = useState("");

  // close sheets on route change
  useEffect(() => {
    setSearchOpen(false);
    setServicesOpen(false);
    setFabOpen(false);
  }, [pathname]);

  const activeId =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/notices")
      ? "notifications"
      : pathname.startsWith("/admission") || pathname.startsWith("/academics")
      ? "services"
      : "";

  const services = [
    { label: "Admission", to: "/admission" },
    { label: "Academics", to: "/academics" },
    { label: "Science Faculty", to: "/academics/science" },
    { label: "Management", to: "/academics/management" },
    { label: "Law Faculty", to: "/academics/law" },
    { label: "Calendar", to: "/academics/calendar" },
    { label: "Exam Results", to: "/academics/results" },
    { label: "Facilities", to: "/facilities" },
    { label: "Gallery", to: "/gallery" },
    { label: "Contact", to: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/notices?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.25)]"
        aria-label="Primary navigation"
      >
        <ul className="grid grid-cols-5 items-end">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeId === t.id;
            if (t.fab) {
              return (
                <li key={t.id} className="flex justify-center -mt-6">
                  <button
                    type="button"
                    onClick={() => setFabOpen(true)}
                    aria-label="Quick actions"
                    className="h-14 w-14 rounded-full bg-gradient-to-br from-secondary to-accent text-secondary-foreground shadow-lg shadow-secondary/30 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                </li>
              );
            }
            const handler =
              t.id === "search"
                ? () => setSearchOpen(true)
                : t.id === "services"
                ? () => setServicesOpen(true)
                : undefined;
            const content = (
              <span className="relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium">
                <motion.span
                  className={cn(
                    "flex items-center justify-center h-7 w-12 rounded-full transition-colors",
                    isActive ? "bg-primary/10" : "bg-transparent"
                  )}
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </motion.span>
                <span
                  className={cn(
                    "leading-none transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="bn-pill"
                    className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-primary"
                  />
                )}
              </span>
            );
            return (
              <li key={t.id}>
                {handler ? (
                  <button type="button" onClick={handler} className="w-full">
                    {content}
                  </button>
                ) : (
                  <Link to={t.path} className="block">
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Search sheet */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <Input
              autoFocus
              placeholder="Search notices, academics, faculty…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit">Go</Button>
          </form>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Popular</p>
            <div className="flex flex-wrap gap-2">
              {["Admission 2081/82", "Science", "Notices", "Results", "Calendar"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    navigate(`/notices?q=${encodeURIComponent(s)}`);
                    setSearchOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-full bg-muted text-sm hover:bg-muted/80"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Services sheet */}
      <Sheet open={servicesOpen} onOpenChange={setServicesOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>All Services</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {services.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="aspect-square flex flex-col items-center justify-center text-center rounded-2xl bg-muted/60 hover:bg-muted active:scale-95 transition p-2"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium leading-tight">{s.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* FAB quick actions */}
      <Sheet open={fabOpen} onOpenChange={setFabOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Quick actions</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/admission" className="rounded-2xl bg-primary text-primary-foreground p-4 text-center font-medium">Apply for admission</Link>
            <Link to="/contact" className="rounded-2xl bg-secondary text-secondary-foreground p-4 text-center font-medium">Contact us</Link>
            <Link to={user ? "/student" : "/login"} className="rounded-2xl bg-muted p-4 text-center font-medium">
              {user ? "My Dashboard" : "Student Login"}
            </Link>
            <Link to="/install" className="rounded-2xl bg-muted p-4 text-center font-medium">Install App</Link>
          </div>
        </SheetContent>
      </Sheet>

      {/* Spacer so content doesn't hide behind the bar */}
      <div className="md:hidden h-20" aria-hidden />
    </>
  );
};

export default PublicBottomNav;
