import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronRight, ChevronLeft, Bell, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";


interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  link_text: string | null;
  display_order: number;
}

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-secondary/20"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.2, 0.5, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const HeroSection = () => {
  const [notices, setNotices] = useState<string[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.9]);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices").select("title").eq("is_published", true)
        .order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(5);
      setNotices(data?.length ? data.map(n => n.title) : ["Welcome to Milestone International College — Excellence in Higher Secondary Education"]);
    };
    const fetchSlides = async () => {
      const { data } = await supabase.from("hero_slides").select("*").eq("is_active", true).order("display_order");
      if (data?.length) setSlides(data);
    };
    fetchNotices();
    fetchSlides();
  }, []);

  // Auto-slide with progress bar
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    setProgress(0);
    const duration = 5000;
    const step = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += step;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        setCurrentSlide(p => (p + 1) % slides.length);
        elapsed = 0;
        setProgress(0);
      }
    }, step);
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length, currentSlide]);

  const pauseAndGo = useCallback((fn: () => void) => {
    fn();
    setProgress(0);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const currentBackground = slides.length > 0 ? slides[currentSlide]?.image_url : null;
  const currentSlideData = slides[currentSlide];

  return (
    <section ref={sectionRef} className="relative min-h-[60vh] sm:min-h-[80vh] lg:min-h-[90vh] flex items-end overflow-hidden">
      {/* Parallax Background */}
      <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
        {currentBackground ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={currentBackground}
              alt="Milestone International College"
              className="w-full h-[120%] object-cover"
              style={{ objectPosition: 'center 30%' }}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-[120%] bg-gradient-to-br from-primary via-primary-dark to-primary" />
        )}
      </motion.div>

      {/* Gradient overlay with animated opacity */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary/60 to-primary/20"
        style={{ opacity: overlayOpacity }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingParticle delay={0} x="10%" y="20%" size={6} />
        <FloatingParticle delay={1.5} x="80%" y="30%" size={4} />
        <FloatingParticle delay={0.8} x="60%" y="60%" size={8} />
        <FloatingParticle delay={2} x="25%" y="70%" size={5} />
        <FloatingParticle delay={1.2} x="90%" y="50%" size={3} />
        <FloatingParticle delay={0.5} x="45%" y="15%" size={7} />
      </div>

      {/* Geometric decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 border border-secondary/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-96 h-96 border border-primary-foreground/5 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Notice ticker */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-secondary">
        <div className="flex items-center h-8 sm:h-9">
          <div className="flex-shrink-0 bg-primary h-full px-3 sm:px-4 flex items-center gap-1.5">
            <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground animate-pulse" />
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

      {/* Slide arrows with hover animations */}
      {slides.length > 1 && (
        <>
          <motion.button
            onClick={() => pauseAndGo(() => setCurrentSlide(p => (p - 1 + slides.length) % slides.length))}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center transition-all"
            whileHover={{ scale: 1.1, backgroundColor: "hsla(0,0%,100%,0.15)" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-primary-foreground" />
          </motion.button>
          <motion.button
            onClick={() => pauseAndGo(() => setCurrentSlide(p => (p + 1) % slides.length))}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass flex items-center justify-center transition-all"
            whileHover={{ scale: 1.1, backgroundColor: "hsla(0,0%,100%,0.15)" }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        </>
      )}

      {/* Content with staggered animation */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pb-16 sm:pb-20 lg:pb-24 pt-20">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="hidden sm:flex items-center gap-2 mb-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div className="w-10 h-px bg-secondary" layoutId="hero-line" />
                <span className="text-secondary text-xs font-semibold uppercase tracking-widest">
                  {currentSlideData?.subtitle || "Excellence in Education"}
                </span>
              </motion.div>

              <motion.h1
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-[1.1] mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {currentSlideData?.title || (
                  <>Shaping Tomorrow's <span className="text-secondary italic">Leaders</span> Today</>
                )}
              </motion.h1>

              <motion.p
                className="hidden sm:block text-primary-foreground/70 text-base md:text-lg mb-8 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Welcome to Milestone International College — a premier +2 institution offering Science, Management, and Law faculties with a vision for excellence.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary-light font-semibold text-sm h-11 px-7 shadow-glow transition-shadow hover:shadow-none" asChild>
                  <Link to={currentSlideData?.link_url || "/gallery"}>
                    {currentSlideData?.link_text || "Explore"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 text-sm h-11 px-7 group" asChild>
                  <Link to="/about">
                    <Play className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" />
                    Learn More
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide indicators with progress */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => pauseAndGo(() => setCurrentSlide(i))}
              className="relative h-1.5 rounded-full overflow-hidden transition-all"
              style={{ width: i === currentSlide ? 32 : 8 }}
              aria-label={`Slide ${i + 1}`}
            >
              <div className="absolute inset-0 bg-primary-foreground/25 rounded-full" />
              {i === currentSlide && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-secondary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Bottom wave separator */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 40" fill="none" className="w-full h-auto">
          <path d="M0 40V20C360 0 720 0 1080 20C1260 30 1350 35 1440 40V40H0Z" fill="hsl(var(--primary))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;