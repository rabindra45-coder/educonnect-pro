import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, ChevronDown, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/" },
  { 
    name: "About", 
    path: "/about",
    dropdown: [
      { name: "School History", path: "/about#history" },
      { name: "Vision & Mission", path: "/about#vision" },
      { name: "Leadership", path: "/about#leadership" },
      { name: "Infrastructure", path: "/about#infrastructure" },
    ]
  },
  { name: "Academics", path: "/academics" },
  { name: "Notice Board", path: "/notices" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

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

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a href="tel:+977-XXX-XXXXXXX" className="flex items-center gap-2 hover:text-secondary transition-colors">
                <Phone className="w-4 h-4" />
                <span>+977-XXX-XXXXXXX</span>
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
      <motion.header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-card/95 backdrop-blur-md shadow-lg" 
            : "bg-card"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-primary-glow transition-shadow duration-300">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-lg font-bold text-foreground leading-tight">
                  Shree Durga Saraswati
                </h1>
                <p className="text-xs text-muted-foreground">Janata Secondary School</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      location.pathname === item.path
                        ? "text-primary bg-primary/10"
                        : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.name}
                    {item.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  
                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.dropdown && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden"
                      >
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* CTA & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button variant="gold" size="lg" className="hidden md:flex" asChild>
                <Link to="/admission">Apply Now</Link>
              </Button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-foreground" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.path}
                      className={cn(
                        "block py-3 text-base font-medium border-b border-border/50 transition-colors",
                        location.pathname === item.path
                          ? "text-primary"
                          : "text-foreground/80 hover:text-primary"
                      )}
                    >
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <div className="pl-4 py-2 space-y-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Button variant="gold" size="lg" className="w-full mt-4" asChild>
                  <Link to="/admission">Apply Now</Link>
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;
