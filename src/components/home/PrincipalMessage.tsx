import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Quote, Loader2 } from "lucide-react";
import defaultPrincipalImage from "@/assets/principal.jpg";
import { supabase } from "@/integrations/supabase/client";

interface SchoolSettings {
  principal_name: string | null;
  principal_message: string | null;
  principal_photo_url: string | null;
  principal_years_experience: number | null;
}

const PrincipalMessage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });

  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("school_settings")
        .select("principal_name, principal_message, principal_photo_url, principal_years_experience")
        .limit(1)
        .single();

      if (data) setSettings(data as any);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const principalName = settings?.principal_name || "Mr. Ram Balak Sharma";
  const principalPhoto = settings?.principal_photo_url || defaultPrincipalImage;
  const yearsExperience = settings?.principal_years_experience || 25;
  const principalMessage = settings?.principal_message || `Education is not just about academic excellence; it's about nurturing
well-rounded individuals who will contribute positively to society. 
At Shree Durga Saraswati Janata Secondary School, we believe in 
holistic development that encompasses intellectual growth, moral values, 
and life skills.

Our dedicated team of educators works tirelessly to create an environment 
where every student can discover their potential and pursue their dreams. 
We combine traditional values with modern teaching methodologies to prepare 
our students for the challenges of tomorrow.

I invite you to join our school family and be part of this beautiful 
journey of learning and growth.`;

  const messageParts = principalMessage.split('\n\n');
  const quote = messageParts[0] || principalMessage;
  const restOfMessage = messageParts.slice(1).join('\n\n');

  return (
    <section className="py-8 xs:py-10 sm:py-16 md:py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-3 xs:px-4">
        <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 lg:gap-12 items-center">
          {/* Image Side */}
          <motion.div 
            className="relative order-2 lg:order-1" 
            initial={{ opacity: 0, x: -50 }} 
            animate={isInView ? { opacity: 1, x: 0 } : {}} 
            transition={{ duration: 0.8 }}
          >
            <div className="relative max-w-xs xs:max-w-sm mx-auto lg:max-w-none">
              {/* Main Image */}
              <div className="relative z-10 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={principalPhoto} 
                  alt={`Principal of Shree Durga Saraswati Janata Secondary School - ${principalName}`} 
                  className="w-full aspect-[4/5] object-cover" 
                />
              </div>
              
              {/* Decorative Elements - Hidden on mobile */}
              <div className="hidden sm:block absolute -top-4 -left-4 w-20 sm:w-24 h-20 sm:h-24 bg-secondary/20 rounded-xl sm:rounded-2xl -z-10"></div>
              <div className="hidden sm:block absolute -bottom-4 -right-4 w-24 sm:w-32 h-24 sm:h-32 bg-primary/10 rounded-xl sm:rounded-2xl -z-10"></div>
              
              {/* Experience Badge */}
              <motion.div 
                className="absolute -bottom-2 -right-2 xs:-bottom-3 xs:-right-3 sm:-bottom-6 sm:-right-6 bg-primary text-primary-foreground p-2.5 xs:p-3 sm:p-6 rounded-lg xs:rounded-xl sm:rounded-2xl shadow-xl z-20" 
                initial={{ scale: 0 }} 
                animate={isInView ? { scale: 1 } : {}} 
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="text-center">
                  <div className="font-display text-lg xs:text-xl sm:text-3xl font-bold">{yearsExperience}+</div>
                  <div className="text-[8px] xs:text-[10px] sm:text-sm text-primary-foreground/80">Years in<br />Education</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            className="order-1 lg:order-2" 
            initial={{ opacity: 0, x: 50 }} 
            animate={isInView ? { opacity: 1, x: 0 } : {}} 
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-2.5 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-[10px] xs:text-xs sm:text-sm font-medium mb-2 xs:mb-3 sm:mb-4">
              From the Principal's Desk
            </span>
            
            <h2 className="font-display text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 xs:mb-4 sm:mb-6">
              A Message from Our{" "}
              <span className="text-primary">Principal</span>
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-6 xs:py-8">
                <Loader2 className="w-5 h-5 xs:w-6 xs:h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="relative mb-3 xs:mb-4 sm:mb-6">
                  <Quote className="absolute -top-1 -left-1 xs:-top-2 xs:-left-2 w-5 h-5 xs:w-6 xs:h-6 sm:w-10 sm:h-10 text-secondary/30" />
                  <p className="text-muted-foreground leading-relaxed pl-5 xs:pl-6 sm:pl-8 text-xs xs:text-sm sm:text-lg italic whitespace-pre-line line-clamp-4 sm:line-clamp-none">
                    {quote}
                  </p>
                </div>

                {restOfMessage && (
                  <div className="text-muted-foreground leading-relaxed mb-4 xs:mb-6 sm:mb-8 text-xs xs:text-sm sm:text-base whitespace-pre-line line-clamp-6 sm:line-clamp-none">
                    {restOfMessage}
                  </div>
                )}

                <div className="border-t border-border pt-3 xs:pt-4 sm:pt-6">
                  <h4 className="font-display text-base xs:text-lg sm:text-xl font-semibold text-foreground">{principalName}</h4>
                  <p className="text-muted-foreground text-xs xs:text-sm sm:text-base">Principal</p>
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