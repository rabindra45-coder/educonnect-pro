import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Notice { id: string; title: string; content: string; category: string | null; created_at: string; }

const NewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("notices").select("id, title, content, category, created_at")
      .eq("is_published", true).order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setNotices(data); setLoading(false); });
  }, []);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background" ref={ref}>
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
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Stay Updated</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground">
              Latest <span className="italic text-primary">News & Events</span>
            </h2>
          </div>
          <Button variant="outline" size="sm" className="self-start sm:self-auto text-xs" asChild>
            <Link to="/notices">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                <div className="h-40 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : notices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-sm">No news available at the moment.</p>
            </div>
          ) : (
            notices.map((notice, i) => (
              <motion.article
                key={notice.id}
                className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Category header */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <span className="text-5xl opacity-15">📰</span>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-[10px] font-semibold uppercase tracking-wider">
                      {notice.category || "General"}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mb-2.5">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(notice.created_at), "MMM dd, yyyy")}</span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">
                    {notice.content.length > 120 ? notice.content.substring(0, 120) + "..." : notice.content}
                  </p>
                  <Link to="/notices" className="inline-flex items-center gap-1.5 text-primary font-medium text-xs hover:gap-2.5 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
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
