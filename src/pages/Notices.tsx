import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Search, Pin, Bell, Loader2, ChevronRight, Home, ArrowRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const categories = ["All", "Academic", "Examination", "Admission", "Events", "Holiday", "General"];

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  attachment_url: string | null;
  hero_image_url: string | null;
  created_at: string;
}

const Notices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("notices")
      .select("*")
      .eq("is_published", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setNotices(data);
        setLoading(false);
      });
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || notice.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.is_pinned);
  const regularNotices = filteredNotices.filter((n) => !n.is_pinned);

  return (
    <>
      <Helmet>
        <title>Notice Board | Milestone International College</title>
        <meta name="description" content="Latest notices, announcements, and updates from Milestone International College." />
      </Helmet>
      
      <MainLayout>
        {/* Hero */}
        <section className="relative py-20 sm:py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Notice Board</h1>
              <p className="text-lg text-primary-foreground/80">Stay informed about announcements, schedules, and updates.</p>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="bg-muted/50 border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center gap-1 hover:text-foreground"><Home className="w-3.5 h-3.5" /> Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Notices</span>
            </nav>
          </div>
        </div>

        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Search & Filter */}
            <motion.div className="bg-card p-5 rounded-xl shadow-sm border border-border/50 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="text" placeholder="Search notices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>{cat}</Button>
                  ))}
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <>
                {/* Pinned */}
                {pinnedNotices.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="w-5 h-5 text-secondary" />
                      <h2 className="font-display text-xl font-semibold text-foreground">Important Notices</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      {pinnedNotices.map((notice, i) => (
                        <motion.div key={notice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Link to={`/notices/${notice.id}`} className="block bg-secondary/10 border-2 border-secondary/30 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                            {notice.hero_image_url && (
                              <div className="h-40 overflow-hidden">
                                <img src={notice.hero_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                            )}
                            <div className="p-5">
                              <div className="flex items-start justify-between mb-2">
                                <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold capitalize">{notice.category}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(notice.created_at), "MMM d, yyyy")}</span>
                              </div>
                              <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{notice.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2">{notice.content}</p>
                              <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3">Read more <ArrowRight className="w-3.5 h-3.5" /></span>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-xl font-semibold text-foreground">All Notices</h2>
                  </div>
                  <div className="space-y-3">
                    {regularNotices.map((notice, i) => (
                      <motion.div key={notice.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Link to={`/notices/${notice.id}`} className="flex gap-4 bg-card p-4 sm:p-5 rounded-xl shadow-sm border border-border/50 hover:shadow-md hover:border-primary/20 transition-all group">
                          {notice.hero_image_url && (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={notice.hero_image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize",
                                notice.category === "academic" && "bg-primary/10 text-primary",
                                notice.category === "examination" && "bg-destructive/10 text-destructive",
                                notice.category === "admission" && "bg-accent/10 text-accent-foreground",
                                notice.category === "events" && "bg-secondary/20 text-secondary-foreground",
                                (!notice.category || notice.category === "general" || notice.category === "holiday") && "bg-muted text-muted-foreground",
                              )}>{notice.category}</span>
                              <span className="text-xs text-muted-foreground">{format(new Date(notice.created_at), "MMM d, yyyy")}</span>
                            </div>
                            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">{notice.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-1 mt-0.5">{notice.content}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {filteredNotices.length === 0 && (
                  <div className="text-center py-16">
                    <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No notices found matching your criteria.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Notices;
