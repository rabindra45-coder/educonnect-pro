import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, ChevronDown, LogIn, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import defaultLogo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about", dropdown: [
    { name: "School History", path: "/about#history" },
    { name: "Vision & Mission", path: "/about#vision" },
    { name: "Leadership", path: "/about#leadership" },
    { name: "Infrastructure", path: "/about#infrastructure" },
  ]},
  { name: "Academics", path: "/academics" },
  { name: "Notice Board", path: "/notices" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [schoolLogo, setSchoolLogo] = useState(defaultLogo);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, hasRole, hasAnyAdminRole } = useAuth();

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase.from("school_settings").select("logo_url").limit(1).single();
      if (data?.logo_url) setSchoolLogo(data.logo_url);
    };
    fetchLogo();
  }, []);

  const getDashboardPath = () => {
    if (hasRole("student")) return "/student";
    if (hasAnyAdminRole()) return "/admin";
    return "/admin/login";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  return (
    <>
      {/* Slim utility bar */}
      <div className="bg-primary text-primary-foreground hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-9 text-xs tracking-wide">
            <div className="flex items-center gap-5">
              <a href="tel:+977-9746834671" className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <Phone className="w-3 h-3" />
                <span>+977-9746834671</span>
              </a>
              <a href="mailto:info@sdsjss.edu.np" className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <Mail className="w-3 h-3" />
                <span>info@sdsjss.edu.np</span>
              </a>
            </div>
            <span className="opacity-60 uppercase tracking-widest text-[10px]">Shree Durga Saraswati Janata Secondary School</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-card/98 backdrop-blur-xl shadow-sm border-border"
          : "bg-card border-transparent"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <img
                src={schoolLogo}
                alt="SDSJSS Logo"
                className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden xs:block">
                <h1 className="font-display text-sm md:text-base font-normal text-foreground leading-tight">
                  Shree Durga Saraswati
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground tracking-wide">
                  Janata Secondary School
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map(item => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1 px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.path
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground"
                    )}
                  >
                    {item.name}
                    {item.dropdown && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
                  </Link>
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-card rounded-lg shadow-lg border border-border overflow-hidden"
                      >
                        {item.dropdown.map(sub => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button size="sm" className="hidden md:flex text-xs font-semibold" asChild>
                <Link to="/admission">Apply Now</Link>
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 px-3">
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">{profile?.full_name?.split(" ")[0] || "Account"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" className="h-9 px-3 text-xs" asChild>
                  <Link to="/login" className="gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                </Button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              >
                {isMobileMenuOpen
                  ? <X className="w-5 h-5 text-foreground" />
                  : <Menu className="w-5 h-5 text-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card border-t border-border overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-3 space-y-0.5">
                {navItems.map(item => (
                  <div key={item.name}>
                    <Link
                      to={item.path}
                      className={cn(
                        "block py-2.5 text-sm font-medium transition-colors",
                        location.pathname === item.path ? "text-primary" : "text-foreground/70"
                      )}
                    >
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <div className="pl-4 pb-1 space-y-0.5">
                        {item.dropdown.map(sub => (
                          <Link key={sub.name} to={sub.path} className="block py-1.5 text-xs text-muted-foreground">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-3 flex gap-2">
                  <Button size="sm" className="flex-1 text-xs" asChild>
                    <Link to="/admission">Apply Now</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                    <Link to="/contact">Contact</Link>
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
