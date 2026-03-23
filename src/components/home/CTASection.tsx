import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted/50" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="relative bg-primary rounded-2xl sm:rounded-3xl px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20 overflow-hidden text-center"
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary-foreground/5 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <motion.div
              className="flex items-center justify-center gap-3 mb-4"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              <div className="w-6 h-px bg-secondary" />
              <span className="text-secondary text-[10px] font-semibold uppercase tracking-widest">Admissions Open</span>
              <div className="w-6 h-px bg-secondary" />
            </motion.div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-primary-foreground mb-4 sm:mb-6 leading-tight">
              Ready to Begin Your <span className="italic text-secondary">Journey</span> With Us?
            </h2>

            <p className="text-sm sm:text-base text-primary-foreground/70 mb-8 max-w-lg mx-auto leading-relaxed">
              Admissions are now open for the academic year 2081/82. Join our community of learners and unlock your potential.
            </p>

            <div className="flex gap-3 justify-center">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary-light font-semibold text-sm h-11 px-7" asChild>
                <Link to="/admission">
                  Apply Now <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 text-sm h-11 px-7" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
