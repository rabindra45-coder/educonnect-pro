// Facility Detail Page
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Home, ChevronRight, ArrowLeft, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Facility {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

const FacilityDetail = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: single }, { data: all }] = await Promise.all([
        supabase.from("facilities").select("*").eq("id", facilityId!).single(),
        supabase.from("facilities").select("*").eq("is_active", true).order("display_order"),
      ]);
      if (single) setFacility(single);
      if (all) setAllFacilities(all.filter((f) => f.id !== facilityId));
      setLoading(false);
    };
    if (facilityId) load();
  }, [facilityId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!facility) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h2 className="text-2xl font-bold text-foreground">Facility Not Found</h2>
          <Link to="/">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{facility.title} | Milestone International College</title>
        <meta name="description" content={facility.description?.slice(0, 160)} />
      </Helmet>

      <MainLayout>
        {/* Hero Banner */}
        <section className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
          {facility.image_url ? (
            <img
              src={facility.image_url}
              alt={facility.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="container mx-auto">
              <motion.h1
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {facility.title}
              </motion.h1>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">{facility.title}</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Highlights */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {[
                  { icon: Star, label: "World-Class", sub: "Infrastructure" },
                  { icon: MapPin, label: "On Campus", sub: "Accessible" },
                  { icon: Star, label: "Well Equipped", sub: "Modern Tools" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Description */}
              <motion.div
                className="prose prose-lg max-w-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  About {facility.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {facility.description}
                </p>
              </motion.div>

              {/* Main Image */}
              {facility.image_url && (
                <motion.div
                  className="mt-10 rounded-2xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <img
                    src={facility.image_url}
                    alt={facility.title}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Other Facilities */}
        {allFacilities.length > 0 && (
          <section className="py-12 bg-muted/30 border-t border-border/50">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Explore Other Facilities
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {allFacilities.slice(0, 3).map((f, i) => (
                  <Link key={f.id} to={`/facilities/${f.id}`}>
                    <motion.div
                      className="group rounded-xl overflow-hidden bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="h-40 overflow-hidden">
                        {f.image_url ? (
                          <img src={f.image_url} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{f.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{f.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </MainLayout>
    </>
  );
};

export default FacilityDetail;
