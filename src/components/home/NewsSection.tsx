import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Notice { id: string; title: string; content: string; category: string | null; created_at: string; }

const NewsSection = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("notices").select("id, title, content, category, created_at")
      .eq("is_published", true).order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setNotices(data); setLoading(false); });
  }, []);

  return (
    <section className="py-20 sm:py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-border" />

      <div className="container mx-auto px-4">
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
            >
              <motion.div
                className="w-12 h-px bg-secondary"
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Stay Updated</span>
            </motion.div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground">
              Latest <span className="italic text-primary">News & Events</span>
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="outline" size="sm" className="text-xs group" asChild>
              <Link to="/notices">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                <div className="h-40 bg-muted animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : notices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Newspaper className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No news available at the moment.</p>
            </div>
          ) : (
            notices.map((notice, i) => (
              <motion.article
                key={notice.id}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all duration-500 group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -6, boxShadow: "0 20px 40px -15px hsla(220,65%,20%,0.15)" }}
                onHoverStart={() => setHoveredId(notice.id)}
                onHoverEnd={() => setHoveredId(null)}
              >
                {/* Category header */}
                <div className="relative h-40 sm:h-44 overflow-hidden bg-gradient-to-br from-primary/8 to-secondary/8 flex items-center justify-center">
                  <motion.span
                    className="text-6xl opacity-10"
                    animate={hoveredId === notice.id ? { scale: 1.3, rotate: 10 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    📰
                  </motion.span>
                  <div className="absolute top-4 left-4">
                    <motion.span
                      className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-[10px] font-semibold uppercase tracking-wider shadow-sm"
                      whileHover={{ scale: 1.05 }}
                    >
                      {notice.category || "General"}
                    </motion.span>
                  </div>
                  {/* Decorative line */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-secondary"
                    initial={{ width: "0%" }}
                    whileInView={{ width: hoveredId === notice.id ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(notice.created_at), "MMM dd, yyyy")}</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-5">
                    {notice.content.length > 120 ? notice.content.substring(0, 120) + "..." : notice.content}
                  </p>
                  <Link to="/notices" className="inline-flex items-center gap-1.5 text-primary font-medium text-xs group/link">
                    Read More
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;