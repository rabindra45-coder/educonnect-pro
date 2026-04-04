import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight, Sparkles } from "lucide-react";

interface Facility {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
}

const FacilitiesSection = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  useEffect(() => {
    supabase
      .from("facilities")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setFacilities(data);
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (facilities.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((p) => (p + 1) % facilities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [facilities.length]);

  if (!loaded || facilities.length === 0) return null;

  const activeFacility = facilities[activeIndex];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden bg-foreground"
    >
      {/* Animated background image */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {activeFacility?.image_url && (
          <motion.img
            key={activeIndex}
            src={activeFacility.image_url}
            alt=""
            className="w-full h-[120%] object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        )}
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/70 to-foreground/95" />

      {/* Geometric accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 -right-20 w-80 h-80 border border-secondary/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-20 w-96 h-96 border border-primary-foreground/5 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span className="text-secondary text-xs font-semibold uppercase tracking-widest">
              Campus Excellence
            </span>
          </motion.div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-card mb-4">
            World-Class{" "}
            <span className="italic text-secondary">Facilities</span>
          </h2>
          <p className="text-card/50 max-w-lg mx-auto text-sm sm:text-base">
            Modern infrastructure designed to nurture academic excellence and holistic development.
          </p>
        </motion.div>

        {/* Interactive showcase */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Feature image */}
          <motion.div
            className="relative aspect-[4/3] rounded-2xl overflow-hidden group"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {activeFacility?.image_url ? (
              <motion.img
                key={activeIndex}
                src={activeFacility.image_url}
                alt={activeFacility.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

            {/* Counter badge */}
            <motion.div
              className="absolute top-5 right-5 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground font-display text-lg font-bold shadow-lg"
              key={activeIndex}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.div>

            {/* Title overlay */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
              key={`title-${activeIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-display text-2xl sm:text-3xl text-card mb-2">
                {activeFacility.title}
              </h3>
              <p className="text-card/70 text-sm sm:text-base leading-relaxed max-w-md">
                {activeFacility.description}
              </p>
            </motion.div>
          </motion.div>

          {/* Right: List selector */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {facilities.map((f, i) => (
              <motion.button
                key={f.id}
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left p-5 sm:p-6 rounded-xl border transition-all duration-500 group relative overflow-hidden ${
                  i === activeIndex
                    ? "bg-card/10 border-secondary/40 backdrop-blur-sm"
                    : "bg-card/5 border-card/10 hover:bg-card/8 hover:border-card/20"
                }`}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Active indicator bar */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-r"
                  initial={false}
                  animate={{ opacity: i === activeIndex ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border border-card/10">
                    {f.image_url ? (
                      <img
                        src={f.image_url}
                        alt={f.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/20" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-secondary/60 text-xs font-mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4
                        className={`font-display text-sm sm:text-base truncate transition-colors ${
                          i === activeIndex
                            ? "text-secondary"
                            : "text-card/80 group-hover:text-card"
                        }`}
                      >
                        {f.title}
                      </h4>
                    </div>
                    <p className="text-card/40 text-xs line-clamp-1">
                      {f.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    className={`w-4 h-4 flex-shrink-0 transition-all ${
                      i === activeIndex
                        ? "text-secondary opacity-100"
                        : "text-card/30 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </div>

                {/* Progress bar for active item */}
                {i === activeIndex && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-secondary/50"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    key={`progress-${activeIndex}`}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Bottom dot indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {facilities.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 bg-secondary"
                  : "w-2 bg-card/20 hover:bg-card/40"
              }`}
              aria-label={`Facility ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
