import { motion } from "framer-motion";
import { ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-school.jpg";
const notices = ["Admission Open for Academic Year 2081/82 - Apply Now!", "Annual Sports Week starts from Poush 15 - All students must participate", "Parent-Teacher Meeting scheduled for Poush 20, 2081", "Winter vacation from Magh 1 to Magh 15, 2081"];
const HeroSection = () => {
  return <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Shree Durga Saraswati Janata Secondary School Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Breaking News Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-secondary/95 py-2 overflow-hidden">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary px-4 py-1 flex items-center gap-2 z-10">
            <Bell className="w-4 h-4 text-primary-foreground" />
            <span className="text-primary-foreground text-sm font-semibold">Latest</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...notices, ...notices].map((notice, index) => <span key={index} className="mx-8 text-secondary-foreground text-sm font-medium">
                  {notice}
                  <span className="mx-8 text-primary">•</span>
                </span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-16">
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
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6 backdrop-blur-sm border border-secondary/30">🎓 Excellence in Education Since 2025</span>
          </motion.div>

          <motion.h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6" initial={{
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

          <motion.p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed" initial={{
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

          <motion.div className="flex flex-col sm:flex-row gap-4" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.8
        }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/admission">
                Apply for Admission
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>;
};
export default HeroSection;