import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Search, Filter, Pin, FileText, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["All", "Academic", "Examination", "Admission", "Events", "Holiday"];

const notices = [
  {
    id: 1,
    title: "Admission Open for Academic Year 2081/82",
    category: "Admission",
    date: "2081-09-15",
    content: "Online applications are now being accepted for Classes 1-10. Early bird discount available until Magh 1, 2081.",
    pinned: true,
    hasAttachment: true,
  },
  {
    id: 2,
    title: "First Terminal Examination Schedule",
    category: "Examination",
    date: "2081-09-10",
    content: "First terminal examinations will be held from Poush 20 to Magh 5, 2081. Students are advised to collect their admit cards.",
    pinned: true,
    hasAttachment: true,
  },
  {
    id: 3,
    title: "Winter Vacation Notice",
    category: "Holiday",
    date: "2081-09-08",
    content: "School will remain closed for winter vacation from Magh 1 to Magh 15, 2081. School will resume on Magh 16.",
    pinned: false,
    hasAttachment: false,
  },
  {
    id: 4,
    title: "Annual Sports Week 2081",
    category: "Events",
    date: "2081-09-05",
    content: "Annual sports week will be organized from Poush 15-20, 2081. All students must participate in at least one event.",
    pinned: false,
    hasAttachment: true,
  },
  {
    id: 5,
    title: "Parent-Teacher Meeting",
    category: "Academic",
    date: "2081-09-01",
    content: "Parent-Teacher meeting for all classes will be held on Poush 20, 2081. Parents are requested to attend without fail.",
    pinned: false,
    hasAttachment: false,
  },
  {
    id: 6,
    title: "Science Exhibition 2081",
    category: "Events",
    date: "2081-08-28",
    content: "Annual Science Exhibition will be held on Mangsir 25, 2081. Students interested in participating should submit their projects.",
    pinned: false,
    hasAttachment: true,
  },
];

const Notices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.pinned);
  const regularNotices = filteredNotices.filter((n) => !n.pinned);

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
                        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                          {notice.category}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {notice.date}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                        {notice.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {notice.content}
                      </p>
                      {notice.hasAttachment && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
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
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            notice.category === "Academic" && "bg-primary/10 text-primary",
                            notice.category === "Examination" && "bg-destructive/10 text-destructive",
                            notice.category === "Admission" && "bg-accent/10 text-accent",
                            notice.category === "Events" && "bg-secondary/20 text-secondary-foreground",
                            notice.category === "Holiday" && "bg-muted text-muted-foreground",
                          )}>
                            {notice.category}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {notice.date}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                          {notice.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {notice.content}
                        </p>
                      </div>
                      {notice.hasAttachment && (
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <FileText className="w-4 h-4 mr-2" />
                          Attachment
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {filteredNotices.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No notices found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Notices;
