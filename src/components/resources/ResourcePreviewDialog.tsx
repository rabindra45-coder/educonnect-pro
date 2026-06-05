import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Calendar, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import type { DigitalResource } from "@/lib/resourceCenter";
import { downloadResource, getSignedUrl, formatBytes } from "@/lib/resourceCenter";
import { useRate } from "@/hooks/useResources";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  resource: DigitalResource | null;
  onClose: () => void;
}

const ResourcePreviewDialog = ({ resource, onClose }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const rate = useRate();

  useEffect(() => {
    let cancelled = false;
    setPreviewUrl(null);
    if (!resource) return;
    (async () => {
      try {
        const url = resource.storage_path ? await getSignedUrl(resource.storage_path, 600) : resource.file_url;
        if (!cancelled) setPreviewUrl(url);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [resource]);

  if (!resource) return null;
  const mime = (resource.file_mime || "").toLowerCase();
  const isImage = mime.startsWith("image/");
  const isPdf = mime.includes("pdf");
  const isVideo = mime.startsWith("video/");
  const isAudio = mime.startsWith("audio/");

  return (
    <Dialog open={!!resource} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8">{resource.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap gap-2 items-center text-xs">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(resource.created_at).toLocaleDateString()}</span>
            <span>·</span>
            <span>{formatBytes(resource.file_size)}</span>
            {resource.subject && <Badge variant="secondary">{resource.subject}</Badge>}
            {resource.class && <Badge variant="outline">Class {resource.class}</Badge>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto rounded-lg border bg-muted/30 min-h-[300px] flex items-center justify-center">
          {!previewUrl ? (
            <div className="text-sm text-muted-foreground">Loading preview…</div>
          ) : isImage ? (
            <img src={previewUrl} alt={resource.title} className="max-h-[60vh] object-contain" />
          ) : isPdf ? (
            <iframe src={previewUrl} title={resource.title} className="w-full h-[60vh]" />
          ) : isVideo ? (
            <video src={previewUrl} controls className="max-h-[60vh] w-full" />
          ) : isAudio ? (
            <audio src={previewUrl} controls className="w-full" />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Preview not available for this file type.</p>
            </div>
          )}
        </div>

        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => {
                  setMyRating(n);
                  rate.mutate({ resourceId: resource.id, rating: n }, {
                    onSuccess: () => toast.success("Thanks for rating!"),
                    onError: (e: any) => toast.error(e?.message || "Rating failed"),
                  });
                }}
                className="p-0.5"
                aria-label={`Rate ${n} stars`}
              >
                <Star className={cn("h-5 w-5", (hoverRating || myRating || Math.round(Number(resource.rating_avg ?? 0))) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {Number(resource.rating_avg ?? 0).toFixed(1)} ({resource.rating_count ?? 0})
            </span>
          </div>
          <Button onClick={async () => {
            try { await downloadResource(resource); toast.success("Download started"); }
            catch (e: any) { toast.error(e?.message || "Download failed"); }
          }}>
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcePreviewDialog;
