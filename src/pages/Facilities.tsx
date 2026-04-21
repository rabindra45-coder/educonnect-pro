import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Sparkles } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";

interface Facility {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
}

const Facilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loaded, setLoaded] = useState(false);

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

  return (
    <>
      <Helmet>
        <title>Our Facilities | Milestone International College</title>
        <meta name="description" content="Explore the world-class facilities at Milestone International College — modern classrooms, science labs, library, sports infrastructure and more." />
      </Helmet>
      <MainLayout>
        {/* Hero */}
        <section className="relative py-20 sm:py-28 bg-gradient-to-br from-primary via-primary-dark to-primary text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full border border-primary-foreground/20" />
            <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full border border-primary-foreground/20" />
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur mb-5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-widest">Campus Excellence</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl mb-4"
            >
              Our <span className="italic text-secondary">Facilities</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary-foreground/80 max-w-2xl mx-auto"
            >
              Modern infrastructure designed to nurture academic excellence and holistic development.
            </motion.p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            {!loaded ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">Facilities will be added soon.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((f, i) => (
                  <Link key={f.id} to={`/facilities/${f.id}`}>
                    <motion.div
                      className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 h-full"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 6) * 0.06 }}
                    >
                      <div className="relative h-52 overflow-hidden">
                        {f.image_url ? (
                          <img
                            src={f.image_url}
                            alt={f.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-card/90 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {f.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{f.description}</p>
                        <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                          Learn More <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Facilities;
