import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";
import classroomImg from "@/assets/classroom.jpg";
import sportsImg from "@/assets/sports.jpg";
import libraryImg from "@/assets/library.jpg";

interface Facility { id: string; title: string; description: string; image_url: string | null; display_order: number; }

const defaultImages = [classroomImg, sportsImg, libraryImg];

const FacilityCard = ({ facility, index, fallbackImg }: { facility: Facility; index: number; fallbackImg: string }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const isLarge = index === 0;

  return (
    <motion.div
      ref={cardRef}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer ${isLarge ? "sm:col-span-2 sm:row-span-2" : ""}`}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      whileHover={{ y: -5 }}
    >
      <motion.div className="relative h-52 sm:h-60 overflow-hidden" style={{ ...(isLarge ? {} : {}) }}>
        <motion.img
          src={facility.image_url || fallbackImg}
          alt={facility.title}
          className="w-full h-full object-cover"
          style={{ y }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 0.7 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent group-hover:from-primary/90 group-hover:via-primary/40 transition-all duration-500" />

        {/* Number badge */}
        <motion.div
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary/90 flex items-center justify-center"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
        >
          <span className="text-secondary-foreground font-bold text-xs">0{index + 1}</span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <motion.h3
              className="font-display text-lg sm:text-xl text-card mb-1 group-hover:text-secondary transition-colors duration-300"
            >
              {facility.title}
            </motion.h3>
            <p className="text-card/60 text-xs leading-relaxed line-clamp-2 group-hover:text-card/80 transition-colors">
              {facility.description}
            </p>
          </div>
          <motion.div
            className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.2 }}
          >
            <ArrowUpRight className="w-4 h-4 text-card" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const FacilitiesSection = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("facilities").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setFacilities(data); setLoaded(true); });
  }, []);

  if (!loaded || facilities.length === 0) return null;

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-muted/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-12 h-px bg-secondary"
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Campus</span>
            </motion.div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground">
              World-Class <span className="italic text-primary">Infrastructure</span>
            </h2>
          </div>
          <motion.p
            className="text-sm text-muted-foreground max-w-md leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            State-of-the-art facilities designed to provide the best learning environment for our students.
          </motion.p>
        </motion.div>

        {/* Masonry-like grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {facilities.map((f, i) => (
            <FacilityCard
              key={f.id}
              facility={f}
              index={i}
              fallbackImg={defaultImages[i % defaultImages.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;