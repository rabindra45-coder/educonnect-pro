import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Save, GripVertical, Users, Award, Building2, MessageSquare, Upload, X, Loader2 } from "lucide-react";

interface Facility {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface Leadership {
  id: string;
  name: string;
  role: string;
  experience: string | null;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  photo_url: string | null;
  rating: number;
  is_active: boolean;
  display_order: number;
}

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

interface AboutContent {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
}

const ContentManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("facilities");
  const [uploading, setUploading] = useState(false);
  
  // File input refs
  const facilityFileRef = useRef<HTMLInputElement>(null);
  const leaderFileRef = useRef<HTMLInputElement>(null);
  const testimonialFileRef = useRef<HTMLInputElement>(null);
  
  // Facilities state
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilityDialog, setFacilityDialog] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [facilityForm, setFacilityForm] = useState({ title: "", description: "", image_url: "", is_active: true });

  // Leadership state
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [leaderDialog, setLeaderDialog] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leadership | null>(null);
  const [leaderForm, setLeaderForm] = useState({ name: "", role: "", experience: "", photo_url: "", is_active: true });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialDialog, setTestimonialDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({ name: "", role: "", content: "", photo_url: "", rating: 5, is_active: true });

  // Stats state
  const [stats, setStats] = useState<Stat[]>([]);
  const [statDialog, setStatDialog] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [statForm, setStatForm] = useState({ label: "", value: "", icon: "", is_active: true });

  // About content state
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchFacilities(),
      fetchLeadership(),
      fetchTestimonials(),
      fetchStats(),
      fetchAboutContent()
    ]);
    setLoading(false);
  };

  const fetchFacilities = async () => {
    const { data } = await supabase.from("facilities").select("*").order("display_order");
    if (data) setFacilities(data);
  };

  const fetchLeadership = async () => {
    const { data } = await supabase.from("leadership").select("*").order("display_order");
    if (data) setLeadership(data);
  };

  const fetchTestimonials = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("display_order");
    if (data) setTestimonials(data);
  };

  const fetchStats = async () => {
    const { data } = await supabase.from("stats").select("*").order("display_order");
    if (data) setStats(data);
  };

  const fetchAboutContent = async () => {
    const { data } = await supabase.from("about_content").select("*");
    if (data) setAboutContent(data);
  };

  // Image upload helper
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    setUploading(true);
    const { error } = await supabase.storage
      .from('content-images')
      .upload(fileName, file);
    
    setUploading(false);
    
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('content-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  // Handle facility image upload
  const handleFacilityImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await uploadImage(file, 'facilities');
    if (url) {
      setFacilityForm({ ...facilityForm, image_url: url });
      toast({ title: "Image uploaded" });
    }
  };

  // Handle leader photo upload
  const handleLeaderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await uploadImage(file, 'leadership');
    if (url) {
      setLeaderForm({ ...leaderForm, photo_url: url });
      toast({ title: "Photo uploaded" });
    }
  };

  // Handle testimonial photo upload
  const handleTestimonialPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await uploadImage(file, 'testimonials');
    if (url) {
      setTestimonialForm({ ...testimonialForm, photo_url: url });
      toast({ title: "Photo uploaded" });
    }
  };

  // Facility CRUD
  const handleSaveFacility = async () => {
    if (editingFacility) {
      const { error } = await supabase.from("facilities").update({
        title: facilityForm.title,
        description: facilityForm.description,
        image_url: facilityForm.image_url || null,
        is_active: facilityForm.is_active
      }).eq("id", editingFacility.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Facility updated" });
      }
    } else {
      const maxOrder = Math.max(...facilities.map(f => f.display_order), 0);
      const { error } = await supabase.from("facilities").insert({
        title: facilityForm.title,
        description: facilityForm.description,
        image_url: facilityForm.image_url || null,
        is_active: facilityForm.is_active,
        display_order: maxOrder + 1
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Facility added" });
      }
    }
    setFacilityDialog(false);
    setEditingFacility(null);
    setFacilityForm({ title: "", description: "", image_url: "", is_active: true });
    fetchFacilities();
  };

  const handleDeleteFacility = async (id: string) => {
    if (!confirm("Delete this facility?")) return;
    await supabase.from("facilities").delete().eq("id", id);
    toast({ title: "Deleted", description: "Facility removed" });
    fetchFacilities();
  };

  // Leadership CRUD
  const handleSaveLeader = async () => {
    if (editingLeader) {
      await supabase.from("leadership").update({
        name: leaderForm.name,
        role: leaderForm.role,
        experience: leaderForm.experience || null,
        photo_url: leaderForm.photo_url || null,
        is_active: leaderForm.is_active
      }).eq("id", editingLeader.id);
      toast({ title: "Success", description: "Leader updated" });
    } else {
      const maxOrder = Math.max(...leadership.map(l => l.display_order), 0);
      await supabase.from("leadership").insert({
        name: leaderForm.name,
        role: leaderForm.role,
        experience: leaderForm.experience || null,
        photo_url: leaderForm.photo_url || null,
        is_active: leaderForm.is_active,
        display_order: maxOrder + 1
      });
      toast({ title: "Success", description: "Leader added" });
    }
    setLeaderDialog(false);
    setEditingLeader(null);
    setLeaderForm({ name: "", role: "", experience: "", photo_url: "", is_active: true });
    fetchLeadership();
  };

  const handleDeleteLeader = async (id: string) => {
    if (!confirm("Delete this leader?")) return;
    await supabase.from("leadership").delete().eq("id", id);
    toast({ title: "Deleted", description: "Leader removed" });
    fetchLeadership();
  };

  // Testimonial CRUD
  const handleSaveTestimonial = async () => {
    if (editingTestimonial) {
      await supabase.from("testimonials").update({
        name: testimonialForm.name,
        role: testimonialForm.role,
        content: testimonialForm.content,
        photo_url: testimonialForm.photo_url || null,
        rating: testimonialForm.rating,
        is_active: testimonialForm.is_active
      }).eq("id", editingTestimonial.id);
      toast({ title: "Success", description: "Testimonial updated" });
    } else {
      const maxOrder = Math.max(...testimonials.map(t => t.display_order), 0);
      await supabase.from("testimonials").insert({
        name: testimonialForm.name,
        role: testimonialForm.role,
        content: testimonialForm.content,
        photo_url: testimonialForm.photo_url || null,
        rating: testimonialForm.rating,
        is_active: testimonialForm.is_active,
        display_order: maxOrder + 1
      });
      toast({ title: "Success", description: "Testimonial added" });
    }
    setTestimonialDialog(false);
    setEditingTestimonial(null);
    setTestimonialForm({ name: "", role: "", content: "", photo_url: "", rating: 5, is_active: true });
    fetchTestimonials();
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Deleted", description: "Testimonial removed" });
    fetchTestimonials();
  };

  // Stats CRUD
  const handleSaveStat = async () => {
    if (editingStat) {
      await supabase.from("stats").update({
        label: statForm.label,
        value: statForm.value,
        icon: statForm.icon || null,
        is_active: statForm.is_active
      }).eq("id", editingStat.id);
      toast({ title: "Success", description: "Stat updated" });
    } else {
      const maxOrder = Math.max(...stats.map(s => s.display_order), 0);
      await supabase.from("stats").insert({
        label: statForm.label,
        value: statForm.value,
        icon: statForm.icon || null,
        is_active: statForm.is_active,
        display_order: maxOrder + 1
      });
      toast({ title: "Success", description: "Stat added" });
    }
    setStatDialog(false);
    setEditingStat(null);
    setStatForm({ label: "", value: "", icon: "", is_active: true });
    fetchStats();
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm("Delete this stat?")) return;
    await supabase.from("stats").delete().eq("id", id);
    toast({ title: "Deleted", description: "Stat removed" });
    fetchStats();
  };

  // About content update
  const handleUpdateAbout = async (sectionKey: string, title: string, content: string) => {
    const existing = aboutContent.find(a => a.section_key === sectionKey);
    if (existing) {
      await supabase.from("about_content").update({ title, content }).eq("section_key", sectionKey);
    } else {
      await supabase.from("about_content").insert({ section_key: sectionKey, title, content });
    }
    toast({ title: "Saved", description: "Content updated" });
    fetchAboutContent();
  };

  // Image upload component
  const ImageUploadField = ({ 
    label, 
    imageUrl, 
    onUpload, 
    onClear,
    inputRef
  }: { 
    label: string; 
    imageUrl: string; 
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div>
      <Label>{label}</Label>
      <div className="mt-2">
        {imageUrl ? (
          <div className="relative inline-block">
            <img src={imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={onClear}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Click to upload</span>
              </>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>
      <Input 
        value={imageUrl} 
        onChange={e => {
          if (label.includes("Image")) {
            setFacilityForm({ ...facilityForm, image_url: e.target.value });
          } else if (label.includes("Photo") && activeTab === "leadership") {
            setLeaderForm({ ...leaderForm, photo_url: e.target.value });
          } else if (label.includes("Photo") && activeTab === "testimonials") {
            setTestimonialForm({ ...testimonialForm, photo_url: e.target.value });
          }
        }}
        placeholder="Or paste URL here..." 
        className="mt-2"
      />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Manage website content, facilities, stats, and more</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="facilities" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Facilities
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Award className="w-4 h-4" /> Stats
            </TabsTrigger>
            <TabsTrigger value="leadership" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Leadership
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Testimonials
            </TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
          </TabsList>

          {/* Facilities Tab */}
          <TabsContent value="facilities">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Facilities</h2>
              <Dialog open={facilityDialog} onOpenChange={setFacilityDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingFacility(null); setFacilityForm({ title: "", description: "", image_url: "", is_active: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Facility
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingFacility ? "Edit" : "Add"} Facility</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input value={facilityForm.title} onChange={e => setFacilityForm({ ...facilityForm, title: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={facilityForm.description} onChange={e => setFacilityForm({ ...facilityForm, description: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Facility Image"
                      imageUrl={facilityForm.image_url}
                      onUpload={handleFacilityImageUpload}
                      onClear={() => setFacilityForm({ ...facilityForm, image_url: "" })}
                      inputRef={facilityFileRef}
                    />
                    <div className="flex items-center gap-2">
                      <Switch checked={facilityForm.is_active} onCheckedChange={c => setFacilityForm({ ...facilityForm, is_active: c })} />
                      <Label>Active</Label>
                    </div>
                    <Button onClick={handleSaveFacility} className="w-full" disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4">
              {facilities.map(f => (
                <Card key={f.id} className={!f.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    {f.image_url ? (
                      <img src={f.image_url} alt={f.title} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{f.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingFacility(f); setFacilityForm({ title: f.title, description: f.description, image_url: f.image_url || "", is_active: f.is_active }); setFacilityDialog(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteFacility(f.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Homepage Statistics</h2>
              <Dialog open={statDialog} onOpenChange={setStatDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingStat(null); setStatForm({ label: "", value: "", icon: "", is_active: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Stat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingStat ? "Edit" : "Add"} Statistic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Label</Label>
                      <Input value={statForm.label} onChange={e => setStatForm({ ...statForm, label: e.target.value })} placeholder="e.g., Students Enrolled" />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input value={statForm.value} onChange={e => setStatForm({ ...statForm, value: e.target.value })} placeholder="e.g., 1500+" />
                    </div>
                    <div>
                      <Label>Icon (optional)</Label>
                      <Input value={statForm.icon} onChange={e => setStatForm({ ...statForm, icon: e.target.value })} placeholder="users, award, graduation-cap, trending-up" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={statForm.is_active} onCheckedChange={c => setStatForm({ ...statForm, is_active: c })} />
                      <Label>Active</Label>
                    </div>
                    <Button onClick={handleSaveStat} className="w-full">
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map(s => (
                <Card key={s.id} className={!s.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{s.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{s.label}</div>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingStat(s); setStatForm({ label: s.label, value: s.value, icon: s.icon || "", is_active: s.is_active }); setStatDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteStat(s.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leadership Tab */}
          <TabsContent value="leadership">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">School Leadership</h2>
              <Dialog open={leaderDialog} onOpenChange={setLeaderDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingLeader(null); setLeaderForm({ name: "", role: "", experience: "", photo_url: "", is_active: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Leader
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingLeader ? "Edit" : "Add"} Leader</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={leaderForm.name} onChange={e => setLeaderForm({ ...leaderForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={leaderForm.role} onChange={e => setLeaderForm({ ...leaderForm, role: e.target.value })} placeholder="e.g., Principal" />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Input value={leaderForm.experience} onChange={e => setLeaderForm({ ...leaderForm, experience: e.target.value })} placeholder="e.g., 25+ years" />
                    </div>
                    <ImageUploadField
                      label="Photo"
                      imageUrl={leaderForm.photo_url}
                      onUpload={handleLeaderPhotoUpload}
                      onClear={() => setLeaderForm({ ...leaderForm, photo_url: "" })}
                      inputRef={leaderFileRef}
                    />
                    <div className="flex items-center gap-2">
                      <Switch checked={leaderForm.is_active} onCheckedChange={c => setLeaderForm({ ...leaderForm, is_active: c })} />
                      <Label>Active</Label>
                    </div>
                    <Button onClick={handleSaveLeader} className="w-full" disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadership.map(l => (
                <Card key={l.id} className={!l.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {l.photo_url ? (
                        <img src={l.photo_url} alt={l.name} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{l.name}</h3>
                        <p className="text-sm text-primary">{l.role}</p>
                        {l.experience && <p className="text-xs text-muted-foreground">{l.experience}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingLeader(l); setLeaderForm({ name: l.name, role: l.role, experience: l.experience || "", photo_url: l.photo_url || "", is_active: l.is_active }); setLeaderDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteLeader(l.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Testimonials</h2>
              <Dialog open={testimonialDialog} onOpenChange={setTestimonialDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingTestimonial(null); setTestimonialForm({ name: "", role: "", content: "", photo_url: "", rating: 5, is_active: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingTestimonial ? "Edit" : "Add"} Testimonial</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={testimonialForm.name} onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={testimonialForm.role} onChange={e => setTestimonialForm({ ...testimonialForm, role: e.target.value })} placeholder="e.g., Parent of Grade 10 Student" />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea value={testimonialForm.content} onChange={e => setTestimonialForm({ ...testimonialForm, content: e.target.value })} />
                    </div>
                    <ImageUploadField
                      label="Photo"
                      imageUrl={testimonialForm.photo_url}
                      onUpload={handleTestimonialPhotoUpload}
                      onClear={() => setTestimonialForm({ ...testimonialForm, photo_url: "" })}
                      inputRef={testimonialFileRef}
                    />
                    <div>
                      <Label>Rating (1-5)</Label>
                      <Input type="number" min={1} max={5} value={testimonialForm.rating} onChange={e => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) || 5 })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={testimonialForm.is_active} onCheckedChange={c => setTestimonialForm({ ...testimonialForm, is_active: c })} />
                      <Label>Active</Label>
                    </div>
                    <Button onClick={handleSaveTestimonial} className="w-full" disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid gap-4">
              {testimonials.map(t => (
                <Card key={t.id} className={!t.is_active ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {t.photo_url ? (
                        <img src={t.photo_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground italic mb-2">"{t.content}"</p>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingTestimonial(t); setTestimonialForm({ name: t.name, role: t.role, content: t.content, photo_url: t.photo_url || "", rating: t.rating, is_active: t.is_active }); setTestimonialDialog(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTestimonial(t.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Page Tab */}
          <TabsContent value="about">
            <div className="space-y-6">
              {["history", "vision", "mission", "principal_message"].map(key => {
                const content = aboutContent.find(a => a.section_key === key);
                return (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="capitalize">{key.replace("_", " ")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Title</Label>
                          <Input 
                            defaultValue={content?.title || ""} 
                            onBlur={e => {
                              const newTitle = e.target.value;
                              const currentContent = aboutContent.find(a => a.section_key === key);
                              if (newTitle !== currentContent?.title) {
                                handleUpdateAbout(key, newTitle, currentContent?.content || "");
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <Textarea 
                            rows={4}
                            defaultValue={content?.content || ""} 
                            onBlur={e => {
                              const newContent = e.target.value;
                              const currentData = aboutContent.find(a => a.section_key === key);
                              if (newContent !== currentData?.content) {
                                handleUpdateAbout(key, currentData?.title || "", newContent);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;