import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Loader2, Quote } from "lucide-react";
import defaultPrincipalImage from "@/assets/principal.jpg";
import { supabase } from "@/integrations/supabase/client";

const PrincipalMessage = () => {
  const ref = useRef(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const contentY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  useEffect(() => {
    supabase.from("school_settings")
      .select("principal_name, principal_message, principal_photo_url, principal_years_experience")
      .limit(1).maybeSingle()
      .then(({ data }) => { if (data) setSettings(data); setLoading(false); });
  }, []);

  const name = settings?.principal_name || "Mr. Ram Balak Sharma";
  const photo = settings?.principal_photo_url || defaultPrincipalImage;
  const years = settings?.principal_years_experience || 25;
  const message = settings?.principal_message || `Education is not just about academic excellence; it's about nurturing well-rounded individuals who will contribute positively to society.\n\nOur dedicated team works tirelessly to create an environment where every student can discover their potential.`;

  const paragraphs = message.split('\n\n');

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-background relative overflow-hidden" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-12 sm:mb-16"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-12 h-px bg-secondary"
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">From the Principal's Desk</span>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Photo with parallax */}
          <motion.div className="lg:col-span-2" style={{ y: imageY }}>
            <motion.div
              className="relative max-w-sm mx-auto lg:max-w-none"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
                <img
                  src={photo}
                  alt={`${name} - Principal`}
                  className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Experience badge with glow */}
              <motion.div
                className="absolute -bottom-5 -right-5 sm:-bottom-6 sm:-right-6 bg-secondary text-secondary-foreground rounded-2xl p-4 sm:p-5 shadow-xl animate-pulse-glow"
                initial={{ scale: 0, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="text-center">
                  <div className="font-display text-2xl sm:text-3xl">{years}+</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-80">Years in<br />Education</div>
                </div>
              </motion.div>

              {/* Decorative frame */}
              <motion.div
                className="absolute -top-3 -left-3 w-20 h-20 border-t-2 border-l-2 border-secondary/30 rounded-tl-2xl"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              />
              <motion.div
                className="absolute -bottom-3 -right-3 w-20 h-20 border-b-2 border-r-2 border-secondary/30 rounded-br-2xl"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              />
            </motion.div>
          </motion.div>

          {/* Content with parallax */}
          <motion.div className="lg:col-span-3" style={{ y: contentY }}>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground mb-8 sm:mb-10 leading-tight">
                A Message from <br className="hidden sm:block" />
                <span className="italic text-primary">Our Principal</span>
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="relative mb-8">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-secondary/20" />
                    <div className="space-y-4 pl-6">
                      {paragraphs.map((p, i) => (
                        <motion.p
                          key={i}
                          className={`text-muted-foreground leading-relaxed text-sm sm:text-base ${i === 0 ? "text-base sm:text-lg text-foreground/80 italic border-l-2 border-secondary pl-4" : ""}`}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                        >
                          {p}
                        </motion.p>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="flex items-center gap-4 pt-6 border-t border-border"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.div
                      className="w-1 h-10 bg-secondary rounded-full"
                      initial={{ height: 0 }}
                      whileInView={{ height: 40 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                    />
                    <div>
                      <h4 className="font-display text-lg sm:text-xl text-foreground">{name}</h4>
                      <p className="text-sm text-muted-foreground">Principal, SDSJSS</p>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PrincipalMessage;