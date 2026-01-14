import { motion } from "framer-motion";
import { Bell, ExternalLink, Pin, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_pinned: boolean;
  attachment_url: string | null;
  created_at: string;
}

interface NoticesCardProps {
  notices: Notice[];
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const NoticesCard = ({ notices, limit = 5, showViewAll = true, onViewAll }: NoticesCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const displayedNotices = limit ? notices.slice(0, limit) : notices;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Bell className="w-4 h-4 text-orange-500" />
            </div>
            Recent Notices
          </CardTitle>
          {showViewAll && notices.length > limit && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
              View All
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No notices yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {displayedNotices.map((notice, index) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                      notice.is_pinned ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${notice.is_pinned ? "bg-primary" : "bg-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {notice.is_pinned && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {notice.category && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                              <Tag className="w-3 h-3 mr-1" />
                              {notice.category}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-1">{notice.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{notice.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">{formatDate(notice.created_at)}</span>
                          {notice.attachment_url && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                              <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                                📎 Attachment
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoticesCard;
