import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string; name: string; role: string; content: string;
  photo_url: string | null; rating: number; display_order: number;
}

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("is_active", true).order("display_order")
      .then(({ data, error }) => { if (data) setTestimonials(data); setIsLoading(false); });
  }, []);

  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-primary relative overflow-hidden" ref={ref}>
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-20 w-40 h-40 border border-primary-foreground rounded-full" />
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-primary-foreground rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-secondary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Testimonials</span>
            <div className="w-8 h-px bg-secondary" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-primary-foreground">
            What Our <span className="italic text-secondary">Community</span> Says
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              className="bg-primary-foreground/[0.06] backdrop-blur-sm rounded-xl p-6 sm:p-7 border border-primary-foreground/[0.08]"
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Quote className="w-7 h-7 text-secondary/40 mb-4" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-primary-foreground/85 leading-relaxed mb-5 text-sm italic line-clamp-4">
                "{t.content}"
              </p>
              <div className="flex items-center gap-3">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-semibold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-primary-foreground">{t.name}</h4>
                  <p className="text-xs text-primary-foreground/60">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
