import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sita Sharma",
    role: "Parent",
    content: "My children have thrived at this school. The teachers are dedicated and the learning environment is excellent. I'm grateful for the holistic education they receive here.",
    rating: 5,
    avatar: "SS",
  },
  {
    id: 2,
    name: "Rajesh Thapa",
    role: "Alumni (Batch 2075)",
    content: "The values and education I received at SDSJSS have been the foundation of my success. The school prepared me well for higher studies and life challenges.",
    rating: 5,
    avatar: "RT",
  },
  {
    id: 3,
    name: "Kamala Devi",
    role: "Parent",
    content: "The school's focus on both academics and extracurricular activities has helped my daughter become a confident and well-rounded individual. Highly recommended!",
    rating: 5,
    avatar: "KD",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-primary relative overflow-hidden" ref={ref}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 border border-primary-foreground rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-primary-foreground rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-primary-foreground rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary-foreground/10 text-secondary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            What Our <span className="text-secondary">Community</span> Says
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Hear from parents, students, and alumni about their experience with our school.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/10"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-secondary/50 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Content */}
              <p className="text-primary-foreground/90 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-primary-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-primary-foreground/70">
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
