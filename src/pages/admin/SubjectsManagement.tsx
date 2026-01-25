import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
  full_marks: number;
  pass_marks: number;
  credit_hours: number;
  is_optional: boolean;
  display_order: number;
  is_active: boolean;
}

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    full_marks: 100,
    pass_marks: 40,
    credit_hours: 4,
    is_optional: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error fetching subjects", variant: "destructive" });
    } else {
      setSubjects(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    if (editingSubject) {
      const { error } = await supabase
        .from("subjects")
        .update(formData)
        .eq("id", editingSubject.id);

      if (error) {
        toast({ title: "Error updating subject", variant: "destructive" });
      } else {
        toast({ title: "Subject updated successfully" });
        fetchSubjects();
      }
    } else {
      const { error } = await supabase.from("subjects").insert([formData]);

      if (error) {
        toast({ title: "Error creating subject", variant: "destructive" });
      } else {
        toast({ title: "Subject created successfully" });
        fetchSubjects();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      full_marks: 100,
      pass_marks: 40,
      credit_hours: 4,
      is_optional: false,
      display_order: 0,
    });
    setEditingSubject(null);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      full_marks: subject.full_marks,
      pass_marks: subject.pass_marks,
      credit_hours: subject.credit_hours,
      is_optional: subject.is_optional,
      display_order: subject.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    const { error } = await supabase.from("subjects").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting subject", variant: "destructive" });
    } else {
      toast({ title: "Subject deleted successfully" });
      fetchSubjects();
    }
  };

  const toggleActive = async (subject: Subject) => {
    const { error } = await supabase
      .from("subjects")
      .update({ is_active: !subject.is_active })
      .eq("id", subject.id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
    } else {
      fetchSubjects();
    }
  };

  return (
    <>
      <Helmet>
        <title>Subjects Management | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Subjects Management</h1>
              <p className="text-muted-foreground">Manage subjects for examination system</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Subject Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <Label>Subject Code *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., MATH"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Marks</Label>
                      <Input
                        type="number"
                        value={formData.full_marks}
                        onChange={(e) => setFormData({ ...formData, full_marks: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Pass Marks</Label>
                      <Input
                        type="number"
                        value={formData.pass_marks}
                        onChange={(e) => setFormData({ ...formData, pass_marks: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Credit Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={formData.credit_hours}
                        onChange={(e) => setFormData({ ...formData, credit_hours: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_optional}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_optional: checked })}
                    />
                    <Label>Optional Subject</Label>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingSubject ? "Update Subject" : "Add Subject"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Full/Pass</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : subjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        No subjects found. Add your first subject!
                      </TableCell>
                    </TableRow>
                  ) : (
                    subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{subject.code}</Badge>
                        </TableCell>
                        <TableCell>
                          {subject.full_marks} / {subject.pass_marks}
                        </TableCell>
                        <TableCell>{subject.credit_hours}</TableCell>
                        <TableCell>
                          <Badge variant={subject.is_optional ? "secondary" : "default"}>
                            {subject.is_optional ? "Optional" : "Compulsory"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={subject.is_active}
                            onCheckedChange={() => toggleActive(subject)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(subject.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
