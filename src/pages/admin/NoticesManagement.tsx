import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  FileText,
  Upload,
  X,
  Image,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  is_published: boolean;
  created_at: string;
  hero_image_url: string | null;
}

const NoticesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [uploading, setUploading] = useState(false);
  const heroImageRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    is_pinned: false,
    is_published: true,
    hero_image_url: "" as string | null,
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotices((data as Notice[]) || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `notice-hero/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("content-images")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("content-images").getPublicUrl(fileName);

      setFormData({ ...formData, hero_image_url: publicUrl });
      toast({ title: "Hero image uploaded" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        is_pinned: formData.is_pinned,
        is_published: formData.is_published,
        hero_image_url: formData.hero_image_url || null,
      };

      if (editingNotice) {
        const { error } = await supabase
          .from("notices")
          .update(payload)
          .eq("id", editingNotice.id);
        if (error) throw error;
        toast({ title: "Notice updated successfully" });
      } else {
        const { error } = await supabase
          .from("notices")
          .insert({ ...payload, created_by: user?.id });
        if (error) throw error;
        toast({ title: "Notice created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Notice deleted successfully" });
      fetchNotices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePin = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from("notices")
        .update({ is_pinned: !notice.is_pinned })
        .eq("id", notice.id);
      if (error) throw error;
      fetchNotices();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const togglePublish = async (notice: Notice) => {
    try {
      const { error } = await supabase
        .from("notices")
        .update({ is_published: !notice.is_published })
        .eq("id", notice.id);
      if (error) throw error;
      fetchNotices();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "general",
      is_pinned: false,
      is_published: true,
      hero_image_url: null,
    });
    setEditingNotice(null);
  };

  const openEditDialog = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      is_pinned: notice.is_pinned,
      is_published: notice.is_published,
      hero_image_url: notice.hero_image_url,
    });
    setIsDialogOpen(true);
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    "general",
    "academic",
    "exam",
    "holiday",
    "event",
    "sports",
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Notice Management
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Create and manage notices with featured images
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNotice ? "Edit Notice" : "Create New Notice"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                {/* Hero Image Upload */}
                <div>
                  <Label>
                    <Image className="w-4 h-4 inline mr-1" />
                    Featured Image (shown on homepage)
                  </Label>
                  <div className="mt-2">
                    {formData.hero_image_url ? (
                      <div className="relative inline-block">
                        <img
                          src={formData.hero_image_url}
                          alt="Hero preview"
                          className="w-full max-w-sm h-40 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, hero_image_url: null })
                          }
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => heroImageRef.current?.click()}
                        className="w-full max-w-sm h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">
                              Click to upload hero image
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={heroImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    required
                    rows={5}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_pinned}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_pinned: checked })
                      }
                    />
                    <Label>Pin Notice</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_published: checked })
                      }
                    />
                    <Label>Publish</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingNotice ? "Update" : "Create"} Notice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Notices List */}
        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filteredNotices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notices found</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={notice.is_pinned ? "border-primary" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Hero image thumbnail */}
                        {notice.hero_image_url && (
                          <img
                            src={notice.hero_image_url}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {notice.is_pinned && (
                              <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                            <h3 className="font-semibold text-foreground truncate">
                              {notice.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                                notice.is_published
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {notice.is_published ? "Published" : "Draft"}
                            </span>
                            {notice.hero_image_url && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary/10 text-secondary-foreground flex-shrink-0">
                                <Image className="w-3 h-3 inline mr-0.5" />
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notice.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                              {notice.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notice.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePin(notice)}
                          title={notice.is_pinned ? "Unpin" : "Pin"}
                        >
                          <Pin
                            className={`w-4 h-4 ${
                              notice.is_pinned ? "text-primary" : ""
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(notice)}
                          title={
                            notice.is_published ? "Unpublish" : "Publish"
                          }
                        >
                          {notice.is_published ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(notice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notice.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NoticesManagement;
