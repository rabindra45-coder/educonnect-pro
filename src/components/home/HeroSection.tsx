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
        .from("notices").select("title").eq("is_published", true)
        .order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5);
      setNotices(data?.length ? data.map(n => n.title) : ["Welcome to Shree Durga Saraswati Janata Secondary School"]);
    };
    const fetchSlides = async () => {
      const { data } = await supabase.from("hero_slides").select("*").eq("is_active", true).order("display_order");
      if (data?.length) setSlides(data);
    };
    fetchNotices();
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const pauseAndGo = useCallback((fn: () => void) => {
    fn();
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const currentBackground = slides.length > 0 ? slides[currentSlide]?.image_url : heroImage;
  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-[55vh] sm:min-h-[75vh] lg:min-h-[85vh] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={currentBackground}
            alt="School"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary/50 to-transparent" />
      </div>

      {/* Notice ticker */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-secondary">
        <div className="flex items-center h-8 sm:h-9">
          <div className="flex-shrink-0 bg-primary h-full px-3 sm:px-4 flex items-center gap-1.5">
            <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
            <span className="text-primary-foreground text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Notice</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee flex whitespace-nowrap">
              {[...notices, ...notices].map((notice, i) => (
                <span key={i} className="mx-6 sm:mx-10 text-secondary-foreground text-[11px] sm:text-xs font-medium">
                  {notice}
                  <span className="mx-4 sm:mx-8 opacity-30">|</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={() => pauseAndGo(() => setCurrentSlide(p => (p - 1 + slides.length) % slides.length))}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center transition-colors" aria-label="Previous">
            <ChevronLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <button onClick={() => pauseAndGo(() => setCurrentSlide(p => (p + 1) % slides.length))}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center transition-colors" aria-label="Next">
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pb-12 sm:pb-16 lg:pb-20 pt-16">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="hidden sm:flex items-center gap-2 mb-5">
                <div className="w-8 h-px bg-secondary" />
                <span className="text-secondary text-xs font-semibold uppercase tracking-widest">
                  {currentSlideData?.subtitle || "Excellence in Education"}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-primary-foreground leading-[1.15] mb-4 sm:mb-6">
                {currentSlideData?.title || (
                  <>Shaping Tomorrow's <span className="text-secondary italic">Leaders</span> Today</>
                )}
              </h1>

              <p className="hidden sm:block text-primary-foreground/75 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                Welcome to Shree Durga Saraswati Janata Secondary School — nurturing young minds with quality education, strong values, and a vision for excellence.
              </p>

              <div className="flex gap-3">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary-light font-semibold text-sm h-11 px-6" asChild>
                  <Link to={currentSlideData?.link_url || "/gallery"}>
                    {currentSlideData?.link_text || "Explore"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 text-sm h-11 px-6" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => pauseAndGo(() => setCurrentSlide(i))}
              className={`h-1.5 rounded-full transition-all ${i === currentSlide ? "bg-secondary w-6" : "bg-primary-foreground/30 w-1.5"}`}
              aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
