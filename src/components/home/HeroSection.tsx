import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-school.jpg";

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
  display_order: number;
}

const HeroSection = () => {
  const [notices, setNotices] = useState<string[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("title")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        setNotices(data.map(n => n.title));
      } else {
        setNotices(["Welcome to Shree Durga Saraswati Janata Secondary School"]);
      }
    };

    const fetchSlides = async () => {
      const { data } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (data && data.length > 0) {
        setSlides(data);
      }
    };

    fetchNotices();
    fetchSlides();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length]);

  // Get current background image
  const currentBackground = slides.length > 0 ? slides[currentSlide]?.image_url : heroImage;
  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[70vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Slider */}
      <div className="absolute inset-0">
      <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={currentBackground}
            alt="Hero background"
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: 'center 30%' }}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Breaking News Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-secondary/95 py-1.5 sm:py-2 overflow-hidden z-20">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary px-2 sm:px-4 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-2 z-10">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            <span className="text-primary-foreground text-xs sm:text-sm font-semibold">Latest</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...notices, ...notices].map((notice, index) => (
                <span key={index} className="mx-4 sm:mx-8 text-secondary-foreground text-xs sm:text-sm font-medium">
                  {notice}
                  <span className="mx-4 sm:mx-8 text-primary">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {currentSlideData?.subtitle ? (
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/20 text-secondary text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm border border-secondary/30">
                  {currentSlideData.subtitle}
                </span>
              ) : (
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/20 text-secondary text-xs sm:text-sm font-medium mb-4 sm:mb-6 backdrop-blur-sm border border-secondary/30">
                  🎓 Excellence in Education Since 2025
                </span>
              )}

              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6">
                {currentSlideData?.title ? (
                  currentSlideData.title
                ) : (
                  <>
                    Shaping Tomorrow's{" "}
                    <span className="text-secondary">Leaders</span> Today
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-lg md:text-xl text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Welcome to Shree Durga Saraswati Janata Secondary School — where we nurture 
                young minds with quality education, strong values, and a vision for excellence.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {currentSlideData?.link_url && currentSlideData?.link_text ? (
                  <Button variant="hero" size="lg" className="text-sm sm:text-base" asChild>
                    <Link to={currentSlideData.link_url}>
                      {currentSlideData.link_text}
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="hero" size="lg" className="text-sm sm:text-base" asChild>
                    <Link to="/gallery">
                      Hiking events
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </Button>
                )}
                <Button variant="hero-outline" size="lg" className="text-sm sm:text-base" asChild>
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-secondary w-6 sm:w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
