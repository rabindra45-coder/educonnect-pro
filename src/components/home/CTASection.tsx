import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="relative bg-gradient-primary rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-primary-foreground/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-secondary/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.h2
              className="font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to Begin Your{" "}
              <span className="text-secondary">Journey</span> With Us?
            </motion.h2>

            <motion.p
              className="text-sm sm:text-base md:text-lg text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Admissions are now open for the academic year 2081/82. Join our community 
              of learners and unlock your potential with quality education.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button variant="hero" size="lg" className="text-sm sm:text-base" asChild>
                <Link to="/admission">
                  Apply for Admission
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" className="text-sm sm:text-base" asChild>
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
