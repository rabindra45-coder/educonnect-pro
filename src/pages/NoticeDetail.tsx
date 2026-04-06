import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Download, ChevronRight, Home, ArrowLeft, Pin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_pinned: boolean;
  attachment_url: string | null;
  hero_image_url: string | null;
  created_at: string;
}

const NoticeDetail = () => {
  const { noticeId } = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("id", noticeId)
        .eq("is_published", true)
        .single();
      if (data) setNotice(data);
      setLoading(false);
    };
    if (noticeId) fetchNotice();
  }, [noticeId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!notice) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Notice Not Found</h2>
          <p className="text-muted-foreground mb-6">This notice may have been removed or is no longer available.</p>
          <Button asChild><Link to="/notices">Back to Notices</Link></Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{notice.title} | Milestone International College</title>
        <meta name="description" content={notice.content.substring(0, 155)} />
      </Helmet>
      <MainLayout>
        {/* Hero */}
        {notice.hero_image_url ? (
          <section className="relative h-64 sm:h-80 overflow-hidden">
            <img src={notice.hero_image_url} alt={notice.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
          </section>
        ) : (
          <section className="relative py-16 bg-primary overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero" />
          </section>
        )}

        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center gap-1 hover:text-foreground"><Home className="w-3.5 h-3.5" /> Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/notices" className="hover:text-foreground">Notices</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium truncate max-w-[200px]">{notice.title}</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Button variant="ghost" size="sm" className="mb-6" asChild>
                <Link to="/notices"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Notices</Link>
              </Button>

              <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 sm:p-10 rounded-2xl shadow-sm border border-border/50">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {notice.category && (
                    <Badge variant="secondary" className="capitalize">{notice.category}</Badge>
                  )}
                  {notice.is_pinned && (
                    <Badge className="bg-secondary text-secondary-foreground"><Pin className="w-3 h-3 mr-1" /> Pinned</Badge>
                  )}
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(notice.created_at), "MMMM d, yyyy")}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">{notice.title}</h1>

                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                  {notice.content}
                </div>

                {notice.attachment_url && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <Button variant="outline" asChild>
                      <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Download Attachment
                      </a>
                    </Button>
                  </div>
                )}
              </motion.article>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default NoticeDetail;
