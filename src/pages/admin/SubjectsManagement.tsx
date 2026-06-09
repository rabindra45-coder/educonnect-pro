import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
  class: string;
  stream: string;
  is_practical: boolean;
  theory_full_marks: number;
  practical_full_marks: number;
  full_marks: number;
  pass_marks: number;
  credit_hours: number;
  is_optional: boolean;
  display_order: number;
  is_active: boolean;
}

const CLASSES = [
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },
  { value: "both", label: "Both (11 & 12)" },
];
const STREAMS = [
  { value: "science", label: "Science" },
  { value: "management", label: "Management" },
  { value: "law", label: "Law" },
  { value: "common", label: "Common (all streams)" },
];

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [classFilter, setClassFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "", code: "", class: "12", stream: "common",
    is_practical: false, theory_full_marks: 75, practical_full_marks: 25,
    full_marks: 100, pass_marks: 35, credit_hours: 5,
    is_optional: false, display_order: 0,
  });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("subjects").select("*").order("display_order");
    if (error) toast({ title: "Error fetching subjects", variant: "destructive" });
    else setSubjects((data as Subject[]) || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code) return toast({ title: "Name and code required", variant: "destructive" });
    const payload = {
      ...form,
      full_marks: form.theory_full_marks + (form.is_practical ? form.practical_full_marks : 0),
    };
    const op = editing
      ? supabase.from("subjects").update(payload).eq("id", editing.id)
      : supabase.from("subjects").insert([payload]);
    const { error } = await op;
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Updated" : "Created" }); fetchSubjects(); setIsDialogOpen(false); resetForm(); }
  };

  const resetForm = () => {
    setForm({ name: "", code: "", class: "12", stream: "common", is_practical: false, theory_full_marks: 75, practical_full_marks: 25, full_marks: 100, pass_marks: 35, credit_hours: 5, is_optional: false, display_order: 0 });
    setEditing(null);
  };

  const handleEdit = (s: Subject) => {
    setEditing(s);
    setForm({
      name: s.name, code: s.code, class: s.class || "12", stream: s.stream || "common",
      is_practical: s.is_practical, theory_full_marks: s.theory_full_marks ?? 75, practical_full_marks: s.practical_full_marks ?? 25,
      full_marks: s.full_marks, pass_marks: s.pass_marks, credit_hours: s.credit_hours,
      is_optional: s.is_optional, display_order: s.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchSubjects(); }
  };

  const toggleActive = async (s: Subject) => {
    await supabase.from("subjects").update({ is_active: !s.is_active }).eq("id", s.id);
    fetchSubjects();
  };

  const filtered = useMemo(() => subjects.filter(s =>
    (classFilter === "all" || s.class === classFilter || s.class === "both") &&
    (streamFilter === "all" || s.stream === streamFilter || s.stream === "common")
  ), [subjects, classFilter, streamFilter]);

  return (
    <>
      <Helmet><title>Subjects Management | Admin</title></Helmet>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Subjects Management</h1>
              <p className="text-muted-foreground">+2 college subjects mapped to class & stream</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Subject</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Edit Subject" : "Add Subject"}</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Subject Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Physics" /></div>
                    <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="PHY101" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Class</Label>
                      <Select value={form.class} onValueChange={(v) => setForm({ ...form, class: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CLASSES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Stream</Label>
                      <Select value={form.stream} onValueChange={(v) => setForm({ ...form, stream: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{STREAMS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div><Label>Has Practical Component</Label><p className="text-xs text-muted-foreground">e.g., Physics, Chemistry, Biology, Computer Science</p></div>
                    <Switch checked={form.is_practical} onCheckedChange={(c) => setForm({ ...form, is_practical: c })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Theory Full Marks</Label><Input type="number" value={form.theory_full_marks} onChange={(e) => setForm({ ...form, theory_full_marks: Number(e.target.value) })} /></div>
                    <div><Label>Practical Full Marks</Label><Input type="number" value={form.practical_full_marks} onChange={(e) => setForm({ ...form, practical_full_marks: Number(e.target.value) })} disabled={!form.is_practical} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Pass Marks</Label><Input type="number" value={form.pass_marks} onChange={(e) => setForm({ ...form, pass_marks: Number(e.target.value) })} /></div>
                    <div><Label>Credit Hours</Label><Input type="number" step="0.5" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: Number(e.target.value) })} /></div>
                    <div><Label>Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_optional} onCheckedChange={(c) => setForm({ ...form, is_optional: c })} />
                    <Label>Optional Subject</Label>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Add"} Subject</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={streamFilter} onValueChange={setStreamFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                {STREAMS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Theory / Prac</TableHead>
                    <TableHead>Cr</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
                    : filtered.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground"><BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />No subjects.</TableCell></TableRow>
                    : filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}{s.is_optional && <Badge variant="secondary" className="ml-2 text-[10px]">Opt</Badge>}</TableCell>
                        <TableCell><Badge variant="outline">{s.code}</Badge></TableCell>
                        <TableCell>{s.class === "both" ? "11 & 12" : s.class}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] capitalize">{s.stream}</Badge></TableCell>
                        <TableCell className="text-xs">{s.theory_full_marks}{s.is_practical ? ` + ${s.practical_full_marks}` : ""}</TableCell>
                        <TableCell>{s.credit_hours}</TableCell>
                        <TableCell><Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} /></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default SubjectsManagement;
