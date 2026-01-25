import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Edit, Trash2, Eye, FileText, BarChart3, GraduationCap } from "lucide-react";
import { format } from "date-fns";

interface Exam {
  id: string;
  title: string;
  exam_type: string;
  academic_year: string;
  class: string;
  section: string | null;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
  created_at: string;
}

const examTypes = [
  { value: "terminal", label: "Terminal Exam" },
  { value: "unit", label: "Unit Test" },
  { value: "monthly", label: "Monthly Test" },
  { value: "final", label: "Final Exam" },
  { value: "pre_board", label: "Pre-Board" },
];

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const ExamsManagement = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    exam_type: "terminal" as string,
    academic_year: "2081/82",
    class: "10",
    section: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching exams", variant: "destructive" });
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.exam_type || !formData.class) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    const examData = {
      title: formData.title,
      exam_type: formData.exam_type as "terminal" | "unit" | "monthly" | "final" | "pre_board",
      academic_year: formData.academic_year,
      class: formData.class,
      section: formData.section || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    };

    if (editingExam) {
      const { error } = await supabase
        .from("exams")
        .update(examData)
        .eq("id", editingExam.id);

      if (error) {
        toast({ title: "Error updating exam", variant: "destructive" });
      } else {
        toast({ title: "Exam updated successfully" });
        fetchExams();
      }
    } else {
      const { error } = await supabase.from("exams").insert([examData]);

      if (error) {
        toast({ title: "Error creating exam", variant: "destructive" });
      } else {
        toast({ title: "Exam created successfully" });
        fetchExams();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      exam_type: "terminal",
      academic_year: "2081/82",
      class: "10",
      section: "",
      start_date: "",
      end_date: "",
    });
    setEditingExam(null);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      exam_type: exam.exam_type,
      academic_year: exam.academic_year,
      class: exam.class,
      section: exam.section || "",
      start_date: exam.start_date || "",
      end_date: exam.end_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    const { error } = await supabase.from("exams").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting exam", variant: "destructive" });
    } else {
      toast({ title: "Exam deleted successfully" });
      fetchExams();
    }
  };

  const togglePublish = async (exam: Exam) => {
    const { error } = await supabase
      .from("exams")
      .update({ is_published: !exam.is_published })
      .eq("id", exam.id);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
    } else {
      toast({ title: exam.is_published ? "Exam unpublished" : "Exam published" });
      fetchExams();
    }
  };

  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.class.includes(searchQuery)
  );

  const getExamTypeLabel = (type: string) => {
    return examTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <>
      <Helmet>
        <title>Exams Management | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Examination Management</h1>
              <p className="text-muted-foreground">Create and manage exams, enter marks, publish results</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingExam ? "Edit Exam" : "Create New Exam"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Exam Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., First Terminal Examination 2081"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Exam Type *</Label>
                      <Select
                        value={formData.exam_type}
                        onValueChange={(value) => setFormData({ ...formData, exam_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Academic Year *</Label>
                      <Input
                        value={formData.academic_year}
                        onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                        placeholder="2081/82"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Class *</Label>
                      <Select
                        value={formData.class}
                        onValueChange={(value) => setFormData({ ...formData, class: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c} value={c}>
                              Class {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Section</Label>
                      <Input
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        placeholder="A, B, C..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingExam ? "Update Exam" : "Create Exam"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exams.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {exams.filter((e) => e.is_published).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {exams.filter((e) => !e.is_published).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exams.filter((e) => e.academic_year.includes("2081")).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredExams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No exams found. Create your first exam!
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getExamTypeLabel(exam.exam_type)}</Badge>
                        </TableCell>
                        <TableCell>
                          Class {exam.class}
                          {exam.section && ` - ${exam.section}`}
                        </TableCell>
                        <TableCell>{exam.academic_year}</TableCell>
                        <TableCell>
                          <Badge
                            variant={exam.is_published ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => togglePublish(exam)}
                          >
                            {exam.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Enter Marks"
                              onClick={() => window.location.href = `/admin/exams/${exam.id}/marks`}
                            >
                              <GraduationCap className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Results"
                              onClick={() => window.location.href = `/admin/exams/${exam.id}/results`}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(exam)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(exam.id)}
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

export default ExamsManagement;
