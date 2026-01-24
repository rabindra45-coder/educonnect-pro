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
    <section className="relative min-h-[50vh] xs:min-h-[55vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-primary/10">
      {/* Background Image with Slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={currentBackground}
            alt="Hero background"
            className="w-full h-full object-contain sm:object-cover"
            style={{ objectPosition: 'center center' }}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        {/* Background fill for letterboxing on mobile */}
        <div className="absolute inset-0 -z-10 bg-primary/20 sm:hidden"></div>
        {/* Enhanced gradient overlay for better text readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60 sm:bg-black/30"></div>
      </div>

      {/* Breaking News Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-secondary/95 py-1 xs:py-1.5 sm:py-2 overflow-hidden z-20">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary px-2 xs:px-2.5 sm:px-4 py-0.5 sm:py-1 flex items-center gap-1 sm:gap-2 z-10">
            <Bell className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            <span className="text-primary-foreground text-[10px] xs:text-xs sm:text-sm font-semibold">Latest</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...notices, ...notices].map((notice, index) => (
                <span key={index} className="mx-3 xs:mx-4 sm:mx-8 text-secondary-foreground text-[10px] xs:text-xs sm:text-sm font-medium">
                  {notice}
                  <span className="mx-3 xs:mx-4 sm:mx-8 text-primary">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slider Navigation Arrows - Hidden on very small screens */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 active:bg-black/70 text-white p-1.5 xs:p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all touch-manipulation"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 active:bg-black/70 text-white p-1.5 xs:p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all touch-manipulation"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 relative z-10 pt-10 xs:pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {currentSlideData?.subtitle ? (
                <span className="inline-block px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full bg-secondary/25 text-secondary text-[10px] xs:text-xs sm:text-sm font-medium mb-3 xs:mb-4 sm:mb-6 backdrop-blur-sm border border-secondary/30">
                  {currentSlideData.subtitle}
                </span>
              ) : (
                <span className="inline-block px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full bg-secondary/25 text-secondary text-[10px] xs:text-xs sm:text-sm font-medium mb-3 xs:mb-4 sm:mb-6 backdrop-blur-sm border border-secondary/30">
                  🎓 Excellence in Education Since 2025
                </span>
              )}

              <h1 className="font-display text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-3 xs:mb-4 sm:mb-6 drop-shadow-lg">
                {currentSlideData?.title ? (
                  currentSlideData.title
                ) : (
                  <>
                    Shaping Tomorrow's{" "}
                    <span className="text-secondary drop-shadow-md">Leaders</span> Today
                  </>
                )}
              </h1>

              <p className="hidden sm:block text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl leading-relaxed drop-shadow-md">
                Welcome to Shree Durga Saraswati Janata Secondary School — where we nurture 
                young minds with quality education, strong values, and a vision for excellence.
              </p>

              <div className="flex flex-row gap-2 xs:gap-3 sm:gap-4">
                {currentSlideData?.link_url && currentSlideData?.link_text ? (
                  <Button variant="hero" size="default" className="text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 h-auto touch-manipulation" asChild>
                    <Link to={currentSlideData.link_url}>
                      {currentSlideData.link_text}
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ml-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="hero" size="default" className="text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 h-auto touch-manipulation" asChild>
                    <Link to="/gallery">
                      Hiking events
                      <ChevronRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 ml-1" />
                    </Link>
                  </Button>
                )}
                <Button variant="hero-outline" size="default" className="text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6 py-2 xs:py-2.5 sm:py-3 h-auto touch-manipulation" asChild>
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Indicators - Better positioned for mobile */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 xs:bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 xs:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 xs:h-2.5 sm:h-3 rounded-full transition-all touch-manipulation ${
                index === currentSlide
                  ? "bg-secondary w-5 xs:w-6 sm:w-8"
                  : "bg-white/50 hover:bg-white/80 active:bg-white w-2 xs:w-2.5 sm:w-3"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-12 xs:h-16 sm:h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
