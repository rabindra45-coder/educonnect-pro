import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string; name: string; role: string; content: string;
  photo_url: string | null; rating: number; display_order: number;
}

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const decorY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setTestimonials(data); setIsLoading(false); });
  }, []);

  // Auto rotate
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => setActiveIndex(p => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-20 sm:py-24 md:py-32 bg-primary relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: decorY }}>
        <motion.div
          className="absolute top-20 left-[10%] w-48 h-48 border border-primary-foreground/5 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-[15%] w-72 h-72 border border-secondary/10 rounded-full"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-[40%] right-[5%] w-3 h-3 rounded-full bg-secondary/30"
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-primary-foreground/20"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="w-10 h-px bg-secondary"
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Testimonials</span>
            <motion.div
              className="w-10 h-px bg-secondary"
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary-foreground">
            What Our <span className="italic text-secondary">Community</span> Says
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              className={`relative rounded-2xl p-6 sm:p-8 border transition-all duration-500 ${
                i === activeIndex
                  ? "bg-primary-foreground/10 border-secondary/30 shadow-lg shadow-secondary/10"
                  : "bg-primary-foreground/[0.04] border-primary-foreground/[0.08]"
              }`}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onHoverStart={() => setActiveIndex(i)}
            >
              {/* Quote icon */}
              <motion.div
                animate={i === activeIndex ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Quote className={`w-8 h-8 mb-5 transition-colors duration-300 ${
                  i === activeIndex ? "text-secondary/60" : "text-secondary/25"
                }`} />
              </motion.div>

              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + j * 0.05 }}
                  >
                    <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                  </motion.div>
                ))}
              </div>

              <p className="text-primary-foreground/80 leading-relaxed mb-6 text-sm italic line-clamp-5">
                "{t.content}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-primary-foreground/10">
                {t.photo_url ? (
                  <motion.img
                    src={t.photo_url}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-secondary/20"
                    whileHover={{ scale: 1.1 }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-semibold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-primary-foreground">{t.name}</h4>
                  <p className="text-xs text-primary-foreground/50">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation dots */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <motion.button
                key={i}
                className={`rounded-full transition-all ${
                  i === activeIndex ? "w-6 h-2 bg-secondary" : "w-2 h-2 bg-primary-foreground/20"
                }`}
                onClick={() => setActiveIndex(i)}
                whileHover={{ scale: 1.3 }}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;