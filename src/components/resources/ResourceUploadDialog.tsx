import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useResources";
import { uploadResourceFile } from "@/lib/resourceCenter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Loader2 } from "lucide-react";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [klass, setKlass] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setFile(null); setTitle(""); setDescription(""); setCategoryId(null);
    setSubject(""); setKlass(""); setFeatured(false);
  };

  const submit = async () => {
    if (!file) return toast.error("Pick a file");
    if (!title.trim()) return toast.error("Title is required");
    setBusy(true);
    try {
      const up = await uploadResourceFile(file, "uploads");
      const { error } = await supabase.from("digital_resources").insert({
        title: title.trim(),
        description: description.trim() || null,
        resource_type: up.mime?.split("/")[0] || "document",
        file_url: "", // unused — we sign storage_path
        storage_path: up.path,
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
      });
      if (error) throw error;
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Resource</DialogTitle>
          <DialogDescription>Add a file to the Digital Resource Center.</DialogDescription>
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
