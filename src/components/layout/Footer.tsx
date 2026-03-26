import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Facebook, Youtube, ArrowUp, ExternalLink } from "lucide-react";
import defaultLogo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

const Footer = () => {
  const [schoolLogo, setSchoolLogo] = useState(defaultLogo);

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase.from("school_settings").select("logo_url").limit(1).single();
      if (data?.logo_url) setSchoolLogo(data.logo_url);
    };
    fetchLogo();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const quickLinks = [
  { name: "About Us", path: "/about" },
  { name: "Academics", path: "/academics" },
  { name: "Notice Board", path: "/notices" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" },
  { name: "Online Admission", path: "/admission" },
  { name: "Library Portal", path: "/library/login" }];


  const academicLinks = [
  { name: "Primary Level", path: "/academics#primary" },
  { name: "Lower Secondary", path: "/academics#lower-secondary" },
  { name: "Secondary Level", path: "/academics#secondary" },
  { name: "Exam Results", path: "/results" },
  { name: "Academic Calendar", path: "/calendar" }];


  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img src={schoolLogo} alt="SDSJSS Logo" className="w-12 h-12 object-contain bg-white/90 rounded-lg p-1" />
              <div>
                <h3 className="font-display text-base leading-tight">Milestone International</h3>
                <p className="text-xs opacity-70">Janata Secondary School</p>
              </div>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed mb-5 max-w-xs">
              Nurturing minds, building futures since establishment. Quality education empowering students to achieve their full potential.
            </p>
            <div className="flex gap-2">
              {[Facebook, Youtube].map((Icon, i) =>
              <a key={i} href="#" className="w-9 h-9 rounded-md bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider opacity-90">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) =>
              <li key={link.name}>
                  <Link to={link.path} className="text-sm opacity-70 hover:opacity-100 hover:text-secondary transition-all">
                    {link.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider opacity-90">Academics</h4>
            <ul className="space-y-2">
              {academicLinks.map((link) =>
              <li key={link.name}>
                  <Link to={link.path} className="text-sm opacity-70 hover:opacity-100 hover:text-secondary transition-all">
                    {link.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider opacity-90">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-sm opacity-70">Balkumar,Lalitpur, Bagmati Province, Nepal</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                <a className="text-sm opacity-70 hover:opacity-100 transition-opacity" href="tel:+977-9746834671">+977-9746834671</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                <a className="text-sm opacity-70 hover:opacity-100 transition-opacity" href="mailto:info@milestonecollege.edu.np">info@miles.edu.np</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-sm opacity-70">Sun – Fri: 10 AM – 4 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-50">
            <p>© {new Date().getFullYear()} SDSJSS. All rights reserved.</p>
            <button onClick={scrollToTop} className="flex items-center gap-1.5 hover:opacity-100 transition-opacity">
              Back to top <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;