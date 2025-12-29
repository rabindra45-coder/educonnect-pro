import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";
import principalImage from "@/assets/principal.jpg";

const PrincipalMessage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={principalImage}
                  alt="Principal of Shree Durga Saraswati Janata Secondary School"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-2xl -z-10"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10"></div>
              
              {/* Experience Badge */}
              <motion.div
                className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl z-20"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="text-center">
                  <div className="font-display text-3xl font-bold">25+</div>
                  <div className="text-sm text-primary-foreground/80">Years in<br />Education</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              From the Principal's Desk
            </span>
            
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              A Message from Our{" "}
              <span className="text-primary">Principal</span>
            </h2>

            <div className="relative mb-6">
              <Quote className="absolute -top-2 -left-2 w-10 h-10 text-secondary/30" />
              <p className="text-muted-foreground leading-relaxed pl-8 text-lg italic">
                Education is not just about academic excellence; it's about nurturing 
                well-rounded individuals who will contribute positively to society. 
                At Shree Durga Saraswati Janata Secondary School, we believe in 
                holistic development that encompasses intellectual growth, moral values, 
                and life skills.
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              Our dedicated team of educators works tirelessly to create an environment 
              where every student can discover their potential and pursue their dreams. 
              We combine traditional values with modern teaching methodologies to prepare 
              our students for the challenges of tomorrow.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              I invite you to join our school family and be part of this beautiful 
              journey of learning and growth.
            </p>

            <div className="border-t border-border pt-6">
              <h4 className="font-display text-xl font-semibold text-foreground">
                Mr. Ram Bahadur Sharma
              </h4>
              <p className="text-muted-foreground">Principal</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PrincipalMessage;
