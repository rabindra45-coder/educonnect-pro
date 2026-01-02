import { motion } from "framer-motion";
import { ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-school.jpg";
const notices = ["Admission Open for Academic Year 2081/82 - Apply Now!", "Annual Sports Week starts from Poush 15 - All students must participate", "Parent-Teacher Meeting scheduled for Poush 20, 2081", "Winter vacation from Magh 1 to Magh 15, 2081"];
const HeroSection = () => {
  return <section className="relative min-h-[70vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Shree Durga Saraswati Janata Secondary School Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Breaking News Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-secondary/95 py-1.5 sm:py-2 overflow-hidden">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary px-2 sm:px-4 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-2 z-10">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            <span className="text-primary-foreground text-xs sm:text-sm font-semibold">Latest</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...notices, ...notices].map((notice, index) => <span key={index} className="mx-4 sm:mx-8 text-secondary-foreground text-xs sm:text-sm font-medium">
                  {notice}
                  <span className="mx-4 sm:mx-8 text-primary">•</span>
                </span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/20 text-secondary text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm border border-secondary/30">🎓 Excellence in Education Since 2025</span>
          </motion.div>

          <motion.h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }}>
            Shaping Tomorrow's{" "}
            <span className="text-secondary">Leaders</span> Today
          </motion.h1>

          <motion.p className="text-sm sm:text-lg md:text-xl text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl leading-relaxed" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }}>
            Welcome to Shree Durga Saraswati Janata Secondary School — where we nurture 
            young minds with quality education, strong values, and a vision for excellence.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.8
        }}>
            <Button variant="hero" size="lg" className="text-sm sm:text-base" asChild>
              <Link to="/admission">
                Apply for Admission
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" className="text-sm sm:text-base" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>;
};
export default HeroSection;