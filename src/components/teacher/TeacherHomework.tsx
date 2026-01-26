import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  CalendarIcon, 
  Loader2, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TeacherHomeworkProps {
  teacherId: string | undefined;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Homework {
  id: string;
  title: string;
  description: string | null;
  class: string;
  section: string | null;
  due_date: string;
  max_marks: number | null;
  is_published: boolean;
  allow_late_submission: boolean | null;
  attachment_url: string | null;
  subject: Subject | null;
  created_at: string;
}

interface Submission {
  id: string;
  student_id: string;
  status: string;
  submitted_at: string | null;
  marks: number | null;
  remarks: string | null;
  is_late: boolean | null;
  student: {
    full_name: string;
    roll_number: number | null;
  };
}

const TeacherHomework = ({ teacherId }: TeacherHomeworkProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<{ class: string; section: string | null }[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class: "",
    section: "",
    subject_id: "",
    due_date: new Date(),
    max_marks: 100,
    allow_late_submission: false,
  });

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchHomework(),
      fetchSubjects(),
      fetchAssignedClasses(),
    ]);
    setIsLoading(false);
  };

  const fetchHomework = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from("homework")
        .select(`
          *,
          subject:subject_id (id, name, code)
        `)
        .eq("teacher_id", teacherId)
        .order("due_date", { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error("Error fetching homework:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("is_active", true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchAssignedClasses = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select("class, section")
        .eq("teacher_id", teacherId);

      if (error) throw error;
      setAssignedClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubmissions = async (homeworkId: string) => {
    try {
      const { data, error } = await supabase
        .from("homework_submissions")
        .select(`
          *,
          student:student_id (full_name, roll_number)
        `)
        .eq("homework_id", homeworkId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleCreateHomework = async () => {
    if (!teacherId || !formData.title || !formData.class || !formData.subject_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("homework").insert({
        teacher_id: teacherId,
        title: formData.title,
        description: formData.description || null,
        class: formData.class,
        section: formData.section || null,
        subject_id: formData.subject_id,
        due_date: format(formData.due_date, "yyyy-MM-dd"),
        max_marks: formData.max_marks,
        allow_late_submission: formData.allow_late_submission,
        is_published: true,
      });

      if (error) throw error;

      toast({
        title: "Homework Created",
        description: "Homework has been created and published.",
      });
      
      setShowCreateDialog(false);
      resetForm();
      fetchHomework();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!confirm("Are you sure you want to delete this homework?")) return;

    try {
      const { error } = await supabase.from("homework").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Homework has been deleted.",
      });
      
      fetchHomework();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGradeSubmission = async (submissionId: string, marks: number, remarks: string) => {
    try {
      const { error } = await supabase
        .from("homework_submissions")
        .update({
          marks,
          remarks,
          status: "graded",
          graded_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Graded",
        description: "Submission has been graded.",
      });

      if (selectedHomework) {
        fetchSubmissions(selectedHomework.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      class: "",
      section: "",
      subject_id: "",
      due_date: new Date(),
      max_marks: 100,
      allow_late_submission: false,
    });
  };

  const viewSubmissions = (hw: Homework) => {
    setSelectedHomework(hw);
    fetchSubmissions(hw.id);
    setShowSubmissionsDialog(true);
  };

  const uniqueClasses = [...new Set(assignedClasses.map((a) => a.class))].sort();

  const filteredHomework = homework.filter((hw) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return new Date(hw.due_date) >= new Date();
    if (activeTab === "past") return new Date(hw.due_date) < new Date();
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Homework & Assignments
            </CardTitle>
            <CardDescription>
              Create and manage homework assignments for your classes
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Homework
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Homework</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter homework title"
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter homework description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Class *</Label>
                    <Select
                      value={formData.class}
                      onValueChange={(v) => setFormData({ ...formData, class: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueClasses.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            Class {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject *</Label>
                    <Select
                      value={formData.subject_id}
                      onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.due_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.due_date ? format(formData.due_date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.due_date}
                          onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Max Marks</Label>
                    <Input
                      type="number"
                      value={formData.max_marks}
                      onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="late"
                    checked={formData.allow_late_submission}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, allow_late_submission: checked as boolean })
                    }
                  />
                  <Label htmlFor="late">Allow late submissions</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateHomework}>
                    Create Homework
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="all">All ({homework.length})</TabsTrigger>
              <TabsTrigger value="active">
                Active ({homework.filter((h) => new Date(h.due_date) >= new Date()).length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({homework.filter((h) => new Date(h.due_date) < new Date()).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredHomework.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No homework found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHomework.map((hw) => (
                    <TableRow key={hw.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{hw.title}</p>
                          {hw.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {hw.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        Class {hw.class}
                        {hw.section && `-${hw.section}`}
                      </TableCell>
                      <TableCell>{hw.subject?.name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {format(new Date(hw.due_date), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>{hw.max_marks}</TableCell>
                      <TableCell>
                        {new Date(hw.due_date) < new Date() ? (
                          <Badge variant="secondary">Past Due</Badge>
                        ) : (
                          <Badge className="bg-green-500">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewSubmissions(hw)}
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteHomework(hw.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Dialog */}
      <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Submissions: {selectedHomework?.title}
            </DialogTitle>
          </DialogHeader>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No submissions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.student?.roll_number || "-"}</TableCell>
                    <TableCell>{sub.student?.full_name}</TableCell>
                    <TableCell>
                      {sub.status === "graded" ? (
                        <Badge className="bg-green-500">Graded</Badge>
                      ) : sub.status === "submitted" ? (
                        <Badge className="bg-blue-500">Submitted</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {sub.is_late && (
                        <Badge variant="outline" className="ml-1 text-amber-600">
                          Late
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.submitted_at
                        ? format(new Date(sub.submitted_at), "MMM d, h:mm a")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {sub.marks !== null ? `${sub.marks}/${selectedHomework?.max_marks}` : "-"}
                    </TableCell>
                    <TableCell>
                      {sub.status === "submitted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const marks = prompt("Enter marks:", "0");
                            if (marks !== null) {
                              const remarks = prompt("Enter remarks (optional):", "") || "";
                              handleGradeSubmission(sub.id, parseInt(marks), remarks);
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Grade
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherHomework;
