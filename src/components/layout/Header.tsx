import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, ChevronDown, LogIn, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import schoolLogo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const navItems = [{
  name: "Home",
  path: "/"
}, {
  name: "About",
  path: "/about",
  dropdown: [{
    name: "School History",
    path: "/about#history"
  }, {
    name: "Vision & Mission",
    path: "/about#vision"
  }, {
    name: "Leadership",
    path: "/about#leadership"
  }, {
    name: "Infrastructure",
    path: "/about#infrastructure"
  }]
}, {
  name: "Academics",
  path: "/academics"
}, {
  name: "Notice Board",
  path: "/notices"
}, {
  name: "Gallery",
  path: "/gallery"
}, {
  name: "Contact",
  path: "/contact"
}];
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    profile,
    signOut,
    hasRole,
    hasAnyAdminRole
  } = useAuth();
  const getDashboardPath = () => {
    if (hasRole("student")) return "/student";
    if (hasAnyAdminRole()) return "/admin";
    return "/admin/login";
  };
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  const [showMobileTopBar, setShowMobileTopBar] = useState(true);
  
  return <>
      {/* Mobile Top Bar */}
      <AnimatePresence>
        {showMobileTopBar && (
          <motion.div 
            className="bg-primary text-primary-foreground py-2 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <a href="tel:+977-9746834671" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                    <Phone className="w-3 h-3" />
                    <span>9746834671</span>
                  </a>
                  <a href="mailto:info@sdsjss.edu.np" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                    <Mail className="w-3 h-3" />
                    <span>info@sdsjss.edu.np</span>
                  </a>
                </div>
                <button 
                  onClick={() => setShowMobileTopBar(false)}
                  className="p-0.5 hover:bg-primary-foreground/20 rounded"
                  aria-label="Close top bar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+977-9746834671" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Phone className="w-4 h-4" />
                <span>+977-9746834671</span>
              </a>
              <a href="mailto:info@sdsjss.edu.np" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@sdsjss.edu.np</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/80">Welcome to SDSJSS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.header className={cn("sticky top-0 z-50 transition-all duration-300", isScrolled ? "bg-card/95 backdrop-blur-md shadow-lg" : "bg-card")} initial={{
      y: -100
    }} animate={{
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 max-w-[70%] sm:max-w-none">
              <img src={schoolLogo} alt="Shree Durga Saraswati Janata Secondary School Logo" className="w-10 h-10 sm:w-14 sm:h-14 object-contain group-hover:scale-105 transition-transform duration-300 flex-shrink-0" />
              <div>
                <h1 className="font-display text-xs sm:text-lg font-bold text-foreground leading-tight line-clamp-2 sm:line-clamp-none">
                  Shree Durga Saraswati
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Janata Secondary School</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => <div key={item.name} className="relative" onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)} onMouseLeave={() => setActiveDropdown(null)}>
                  <Link to={item.path} className={cn("flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200", location.pathname === item.path ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-primary hover:bg-primary/5")}>
                    {item.name}
                    {item.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  
                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.name && <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: 10
                }} transition={{
                  duration: 0.2
                }} className="absolute top-full left-0 mt-1 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden">
                        {item.dropdown.map(subItem => <Link key={subItem.name} to={subItem.path} className="block px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors">
                            {subItem.name}
                          </Link>)}
                      </motion.div>}
                  </AnimatePresence>
                </div>)}
            </nav>

            {/* CTA & User Menu & Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button variant="gold" size="sm" className="hidden md:flex text-xs sm:text-sm" asChild>
                <Link to="/admission">Apply Now</Link>
              </Button>

              {/* User Auth Menu */}
              {user ? <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline text-xs sm:text-sm">{profile?.full_name?.split(" ")[0] || "Account"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> : <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3" asChild>
                  <Link to="/login" className="gap-1 sm:gap-2">
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-xs sm:text-sm">Student Login</span>
                  </Link>
                </Button>}
              
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors">
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: "auto"
        }} exit={{
          opacity: 0,
          height: 0
        }} className="lg:hidden bg-card border-t border-border">
              <nav className="container mx-auto px-4 py-4">
                {navItems.map(item => <div key={item.name}>
                    <Link to={item.path} className={cn("block py-3 text-base font-medium border-b border-border/50 transition-colors", location.pathname === item.path ? "text-primary" : "text-foreground/80 hover:text-primary")}>
                      {item.name}
                    </Link>
                    {item.dropdown && <div className="pl-4 py-2 space-y-2">
                        {item.dropdown.map(subItem => <Link key={subItem.name} to={subItem.path} className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            {subItem.name}
                          </Link>)}
                      </div>}
                  </div>)}
                <Button variant="gold" size="lg" className="w-full mt-4" asChild>
                  <Link to="/admission">Apply Now</Link>
                </Button>
              </nav>
            </motion.div>}
        </AnimatePresence>
      </motion.header>
    </>;
};
export default Header;