import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  photo_url: string | null;
  rating: number;
  display_order: number;
}

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("display_order");
        
        if (error) {
          console.error("Error fetching testimonials:", error);
        } else if (data) {
          setTestimonials(data);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't render section if no testimonials after loading
  if (!isLoading && testimonials.length === 0) return null;

  return (
    <section className="py-8 xs:py-10 sm:py-16 md:py-20 bg-primary relative overflow-hidden" ref={ref}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 xs:w-24 sm:w-40 h-20 xs:h-24 sm:h-40 border border-primary-foreground rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-28 xs:w-36 sm:w-60 h-28 xs:h-36 sm:h-60 border border-primary-foreground rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 xs:w-64 sm:w-96 h-48 xs:h-64 sm:h-96 border border-primary-foreground rounded-full"></div>
      </div>

      <div className="container mx-auto px-3 xs:px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-6 xs:mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full bg-primary-foreground/10 text-secondary text-[10px] xs:text-xs sm:text-sm font-medium mb-2 xs:mb-3 sm:mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-2 xs:mb-3 sm:mb-4">
            What Our <span className="text-secondary">Community</span> Says
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-xs xs:text-sm sm:text-base">
            Hear from parents, students, and alumni about their experience with our school.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 md:p-8 border border-primary-foreground/10 active:scale-[0.98] transition-transform touch-manipulation"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Quote Icon */}
              <Quote className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-secondary/50 mb-2 xs:mb-3 sm:mb-4" />

              {/* Rating */}
              <div className="flex gap-0.5 mb-2 xs:mb-3 sm:mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-primary-foreground/90 leading-relaxed mb-3 xs:mb-4 sm:mb-6 italic text-xs xs:text-sm sm:text-base line-clamp-4">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
                {testimonial.photo_url ? (
                  <img
                    src={testimonial.photo_url}
                    alt={testimonial.name}
                    className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-xs xs:text-sm sm:text-base">
                    {getInitials(testimonial.name)}
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-primary-foreground text-xs xs:text-sm sm:text-base">
                    {testimonial.name}
                  </h4>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-primary-foreground/70">
                    {testimonial.role}
                  </p>
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