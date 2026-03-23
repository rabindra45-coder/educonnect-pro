import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import defaultPrincipalImage from "@/assets/principal.jpg";
import { supabase } from "@/integrations/supabase/client";

const PrincipalMessage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("school_settings")
      .select("principal_name, principal_message, principal_photo_url, principal_years_experience")
      .limit(1).single()
      .then(({ data }) => { if (data) setSettings(data); setLoading(false); });
  }, []);

  const name = settings?.principal_name || "Mr. Ram Balak Sharma";
  const photo = settings?.principal_photo_url || defaultPrincipalImage;
  const years = settings?.principal_years_experience || 25;
  const message = settings?.principal_message || `Education is not just about academic excellence; it's about nurturing well-rounded individuals who will contribute positively to society. At our school, we believe in holistic development that encompasses intellectual growth, moral values, and life skills.\n\nOur dedicated team works tirelessly to create an environment where every student can discover their potential. We combine traditional values with modern teaching methodologies to prepare our students for the challenges of tomorrow.`;

  const paragraphs = message.split('\n\n');

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-10 sm:mb-14"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="w-8 h-px bg-secondary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">From the Principal's Desk</span>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-14 items-start">
          {/* Photo */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="relative max-w-sm mx-auto lg:max-w-none">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={photo}
                  alt={`${name} - Principal`}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
              {/* Experience badge */}
              <motion.div
                className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 bg-secondary text-secondary-foreground rounded-xl p-3 sm:p-4 shadow-lg"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <div className="text-center">
                  <div className="font-display text-xl sm:text-2xl">{years}+</div>
                  <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider opacity-80">Years in<br />Education</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-6 sm:mb-8 leading-tight">
              A Message from <br className="hidden sm:block" />
              <span className="italic text-primary">Our Principal</span>
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {paragraphs.map((p, i) => (
                    <p key={i} className={`text-muted-foreground leading-relaxed text-sm sm:text-base ${i === 0 ? "text-base sm:text-lg text-foreground/80 italic border-l-2 border-secondary pl-4" : ""}`}>
                      {p}
                    </p>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div>
                    <h4 className="font-display text-lg sm:text-xl text-foreground">{name}</h4>
                    <p className="text-sm text-muted-foreground">Principal, SDSJSS</p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PrincipalMessage;
