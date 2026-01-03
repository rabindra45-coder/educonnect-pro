import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Search, Pin, FileText, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const categories = ["All", "Academic", "Examination", "Admission", "Events", "Holiday", "General"];

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  is_published: boolean;
  attachment_url: string | null;
  created_at: string;
}

const Notices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .eq("is_published", true)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (data && !error) {
        setNotices(data);
      }
      setLoading(false);
    };

    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
                           notice.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.is_pinned);
  const regularNotices = filteredNotices.filter((n) => !n.is_pinned);

  return (
    <>
      <Helmet>
        <title>Notice Board | Shree Durga Saraswati Janata Secondary School</title>
        <meta 
          name="description" 
          content="Stay updated with the latest notices, announcements, and important information from Shree Durga Saraswati Janata Secondary School." 
        />
      </Helmet>
      
      <MainLayout>
        {/* Page Header */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Notice Board
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Stay informed about the latest announcements, schedules, and important updates.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Notices Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Search and Filter */}
            <motion.div
              className="bg-card p-6 rounded-2xl shadow-card mb-8 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search notices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Pinned Notices */}
                {pinnedNotices.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Pin className="w-5 h-5 text-secondary" />
                      <h2 className="font-display text-xl font-semibold text-foreground">
                        Important Notices
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      {pinnedNotices.map((notice, index) => (
                        <motion.div
                          key={notice.id}
                          className="bg-secondary/10 border-2 border-secondary/30 p-6 rounded-xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold capitalize">
                              {notice.category}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(notice.created_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                            {notice.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {notice.content}
                          </p>
                          {notice.attachment_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

            {/* Regular Notices */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">
                  All Notices
                </h2>
              </div>
              <div className="space-y-4">
                {regularNotices.map((notice, index) => (
                  <motion.div
                    key={notice.id}
                    className="bg-card p-6 rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                            notice.category === "academic" && "bg-primary/10 text-primary",
                            notice.category === "examination" && "bg-destructive/10 text-destructive",
                            notice.category === "admission" && "bg-accent/10 text-accent",
                            notice.category === "events" && "bg-secondary/20 text-secondary-foreground",
                            notice.category === "holiday" && "bg-muted text-muted-foreground",
                            notice.category === "general" && "bg-muted text-muted-foreground",
                          )}>
                            {notice.category}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(notice.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                          {notice.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                      {notice.attachment_url && (
                        <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                          <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4 mr-2" />
                            Attachment
                          </a>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {filteredNotices.length === 0 && !loading && (
              <div className="text-center py-12">
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
