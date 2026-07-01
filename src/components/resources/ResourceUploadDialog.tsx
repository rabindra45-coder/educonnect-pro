import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useResources";
import { uploadResourceFile, BUCKET } from "@/lib/resourceCenter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
}

const ResourceUploadDialog = ({ open, onOpenChange, onSaved }: Props) => {
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [klass, setKlass] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setFile(null); setCover(null); setCoverPreview(null);
    setTitle(""); setDescription(""); setCategoryId(null);
    setSubject(""); setKlass(""); setFeatured(false);
  };

  const pickCover = (f: File | null) => {
    setCover(f);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (!file) return toast.error("Pick a file");
    if (!title.trim()) return toast.error("Title is required");
    setBusy(true);
    try {
      const up = await uploadResourceFile(file, "uploads");

      // Covers go to the PUBLIC content-images bucket so <img> can load them directly.
      let coverUrl: string | null = null;
      if (cover) {
        const ext = (cover.name.split(".").pop() || "png").toLowerCase();
        const path = `resource-covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: cErr } = await supabase.storage.from("content-images").upload(path, cover, { contentType: cover.type || "image/png", upsert: false });
        if (cErr) throw cErr;
        coverUrl = supabase.storage.from("content-images").getPublicUrl(path).data.publicUrl;
      }

      const { data: inserted, error } = await supabase.from("digital_resources").insert({
        title: title.trim(),
        description: description.trim() || null,
        resource_type: up.mime?.split("/")[0] || "document",
        file_url: "",
        storage_path: up.path,
        cover_image_url: coverUrl,
        file_name: up.name,
        file_size: up.size,
        file_mime: up.mime,
        category_id: categoryId,
        subject: subject || null,
        class: klass || null,
        is_featured: featured,
        is_downloadable: true,
        is_active: true,
        uploaded_by: user?.id ?? null,
      }).select("id").single();
      if (error) throw error;
      if (inserted?.id) {
        supabase.functions.invoke("notify-resource-upload", { body: { resource_id: inserted.id } });
      }
      toast.success("Resource uploaded");
      reset();
      onOpenChange(false);
      onSaved?.();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) { onOpenChange(o); if (!o) reset(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>Add a file (and optional cover) to the Digital Resource Center.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
            }} />
          </div>

          <div>
            <Label>Cover image (optional)</Label>
            {coverPreview ? (
              <div className="relative mt-1 rounded-lg overflow-hidden border bg-muted/30">
                <img src={coverPreview} alt="Cover preview" className="w-full max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => pickCover(null)}
                  className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 hover:bg-background"
                  aria-label="Remove cover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex items-center justify-center gap-2 h-24 rounded-lg border border-dashed cursor-pointer hover:bg-muted/30 text-sm text-muted-foreground">
                <ImagePlus className="h-4 w-4" />
                <span>Click to add a cover image</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => pickCover(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={categoryId ?? ""} onValueChange={(v) => setCategoryId(v || null)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subj">Subject (optional)</Label>
              <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cls">Class (optional)</Label>
              <Input id="cls" value={klass} onChange={(e) => setKlass(e.target.value)} placeholder="11 / 12" />
            </div>
            <div className="flex items-end gap-2">
              <Switch id="feat" checked={featured} onCheckedChange={setFeatured} />
              <Label htmlFor="feat" className="mb-1">Featured</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceUploadDialog;
