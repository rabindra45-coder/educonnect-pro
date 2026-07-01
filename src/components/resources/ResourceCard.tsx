import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download, Heart, Eye, Sparkles, FileText, Image as ImageIcon, Video, Music, FileSpreadsheet, Presentation, Archive, File, Trash2 } from "lucide-react";
import type { DigitalResource } from "@/lib/resourceCenter";
import { downloadResource, formatBytes, iconForType } from "@/lib/resourceCenter";
import { useToggleFavorite } from "@/hooks/useResources";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Image: ImageIcon, Video, Music, FileText, FileSpreadsheet, Presentation, Archive, File,
};

interface Props {
  resource: DigitalResource;
  isFavorite?: boolean;
  onPreview?: (r: DigitalResource) => void;
}

const ResourceCard = ({ resource, isFavorite, onPreview }: Props) => {
  const fav = useToggleFavorite();
  const Icon = ICONS[iconForType(resource.file_mime, resource.resource_type)] ?? File;

const ResourceCard = ({ resource, isFavorite, onPreview }: Props) => {
  const fav = useToggleFavorite();
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const Icon = ICONS[iconForType(resource.file_mime, resource.resource_type)] ?? File;

  const canDelete =
    !!user &&
    (roles?.some((r) => ["super_admin", "admin"].includes(r)) || resource.uploaded_by === user.id);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await downloadResource(resource);
      toast.success("Download started");
    } catch (err: any) {
      toast.error(err?.message || "Download failed");
    }
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    fav.mutate(resource.id, {
      onError: (err: any) => toast.error(err?.message || "Could not update favorite"),
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("digital_resources")
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq("id", resource.id);
      if (error) throw error;
      toast.success("Resource deleted");
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["resource-analytics"] });
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card
      onClick={() => onPreview?.(resource)}
      className="group relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 overflow-hidden">
        {resource.cover_image_url ? (
          <img
            src={resource.cover_image_url}
            alt={resource.title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {resource.is_featured && (
          <Badge className="absolute left-2 top-2 gap-1 bg-amber-500/95 text-white border-0">
            <Sparkles className="h-3 w-3" /> Featured
          </Badge>
        )}
        {resource.ai_generated && (
          <Badge variant="secondary" className="absolute right-2 top-2 gap-1 bg-purple-500/95 text-white border-0">
            <Sparkles className="h-3 w-3" /> AI
          </Badge>
        )}
        <button
          onClick={handleFav}
          aria-label="Toggle favorite"
          className="absolute bottom-2 right-2 rounded-full bg-background/90 p-2 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Heart className={cn("h-4 w-4", isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
        </button>
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{resource.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Download className="h-3 w-3" />{resource.download_count}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{resource.view_count}</span>
          {!!resource.rating_count && (
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{Number(resource.rating_avg ?? 0).toFixed(1)}</span>
          )}
          <span className="ml-auto">{formatBytes(resource.file_size)}</span>
        </div>
        <Button size="sm" className="w-full h-8" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download
        </Button>
      </div>
    </Card>
  );
};

export default ResourceCard;
