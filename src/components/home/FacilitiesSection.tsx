import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import classroomImg from "@/assets/classroom.jpg";
import sportsImg from "@/assets/sports.jpg";
import libraryImg from "@/assets/library.jpg";

interface Facility { id: string; title: string; description: string; image_url: string | null; display_order: number; }

const defaultImages = [classroomImg, sportsImg, libraryImg];

const FacilitiesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("facilities").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => { if (data) setFacilities(data); setLoaded(true); });
  }, []);

  if (!loaded) return null;
  if (facilities.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted/50" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-secondary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Campus</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground">
              World-Class <span className="italic text-primary">Infrastructure</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            State-of-the-art facilities designed to provide the best learning environment for our students.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {facilities.map((f, i) => (
            <motion.div
              key={f.id}
              className="group relative rounded-xl overflow-hidden bg-card cursor-pointer"
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="relative h-52 sm:h-60 overflow-hidden">
                <img
                  src={f.image_url || defaultImages[i % defaultImages.length]}
                  alt={f.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-lg text-card mb-1">{f.title}</h3>
                <p className="text-card/70 text-xs leading-relaxed line-clamp-2">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
