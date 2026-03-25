import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-muted/50 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="relative bg-primary rounded-3xl px-6 py-14 sm:px-14 sm:py-20 md:px-20 md:py-24 overflow-hidden text-center"
          style={{ scale, opacity }}
        >
          {/* Animated decorative elements */}
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], y: [0, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          {/* Floating sparkles */}
          <motion.div
            className="absolute top-10 left-[20%]"
            animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-secondary/30" />
          </motion.div>
          <motion.div
            className="absolute bottom-16 right-[25%]"
            animate={{ y: [0, 10, 0], rotate: [0, -180, -360] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-secondary/20" />
          </motion.div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              className="flex items-center justify-center gap-3 mb-5"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-8 h-px bg-secondary"
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <span className="text-secondary text-[10px] font-semibold uppercase tracking-widest">Admissions Open</span>
              <motion.div
                className="w-8 h-px bg-secondary"
                initial={{ width: 0 }}
                whileInView={{ width: 32 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>

            <motion.h2
              className="font-display text-3xl sm:text-4xl md:text-5xl text-primary-foreground mb-5 sm:mb-7 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Ready to Begin Your <span className="italic text-secondary">Journey</span> With Us?
            </motion.h2>

            <motion.p
              className="text-sm sm:text-base text-primary-foreground/65 mb-10 max-w-lg mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Admissions are now open for the academic year 2081/82. Join our community of learners and unlock your potential.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary-light font-semibold text-sm h-12 px-8 shadow-glow group"
                asChild
              >
                <Link to="/admission">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 text-sm h-12 px-8"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;