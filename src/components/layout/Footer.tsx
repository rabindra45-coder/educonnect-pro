import { Link } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook, 
  Twitter, 
  Youtube,
  ArrowUp
} from "lucide-react";
import schoolLogo from "@/assets/logo.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Academics", path: "/academics" },
    { name: "Notice Board", path: "/notices" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
    { name: "Online Admission", path: "/admission" },
  ];

  const academics = [
    { name: "Primary Level", path: "/academics#primary" },
    { name: "Lower Secondary", path: "/academics#lower-secondary" },
    { name: "Secondary Level", path: "/academics#secondary" },
    { name: "Exam Results", path: "/results" },
    { name: "Academic Calendar", path: "/calendar" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* School Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img 
                src={schoolLogo} 
                alt="Shree Durga Saraswati Janata Secondary School Logo" 
                className="w-16 h-16 object-contain bg-white rounded-full p-1"
              />
              <div>
                <h3 className="font-display text-lg font-bold leading-tight">
                  Shree Durga Saraswati
                </h3>
                <p className="text-sm text-primary-foreground/80">Janata Secondary School</p>
              </div>
            </Link>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              Nurturing minds, building futures. We are committed to providing quality education 
              that empowers students to achieve their full potential.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 relative">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-secondary -mb-2"></span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 relative">
              Academics
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-secondary -mb-2"></span>
            </h4>
            <ul className="space-y-3">
              {academics.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 relative">
              Contact Us
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-secondary -mb-2"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80 text-sm">
                  Ward No. X, Municipality Name<br />
                  District, Province, Nepal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                <a href="tel:+977-XXX-XXXXXXX" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                  +977-XXX-XXXXXXX
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                <a href="mailto:info@sdsjss.edu.np" className="text-primary-foreground/80 hover:text-secondary transition-colors text-sm">
                  info@sdsjss.edu.np
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">
                  Sun - Fri: 10:00 AM - 4:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Shree Durga Saraswati Janata Secondary School. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-primary-foreground/60 hover:text-secondary transition-colors text-sm"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
