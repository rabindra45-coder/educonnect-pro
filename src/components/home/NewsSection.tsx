import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
}

const NewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, content, category, created_at")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        setNotices(data);
      }
      setLoading(false);
    };

    fetchNotices();
  }, []);

  const getExcerpt = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-subtle" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Stay Updated
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Latest <span className="text-primary">News & Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Stay connected with the latest happenings, achievements, and upcoming events at our school.
          </p>
        </motion.div>

        {/* News Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-card animate-pulse"
              >
                <div className="h-36 sm:h-48 bg-muted"></div>
                <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-5 sm:h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : notices.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-muted-foreground text-sm sm:text-base">No news available at the moment.</p>
            </div>
          ) : (
            notices.map((notice, index) => (
              <motion.article
                key={notice.id}
                className="bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Image placeholder with category */}
                <div className="relative h-36 sm:h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl sm:text-6xl opacity-20">📰</span>
                  </div>
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-semibold capitalize">
                      {notice.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{formatDate(notice.created_at)}</span>
                  </div>
                  <h3 className="font-display text-base sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                    {getExcerpt(notice.content)}
                  </p>
                  <Link 
                    to="/notices"
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-primary font-medium text-xs sm:text-sm hover:gap-2 sm:hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </motion.article>
            ))
          )}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="outline" size="default" className="sm:text-base" asChild>
            <Link to="/notices">
              View All News
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
