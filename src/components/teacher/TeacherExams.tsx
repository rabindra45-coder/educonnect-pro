import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Loader2, 
  Edit,
  CalendarIcon,
  Users,
  Save,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

interface TeacherExamsProps {
  teacherId: string | undefined;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  full_marks: number | null;
  pass_marks: number | null;
}

interface Exam {
  id: string;
  title: string;
  class: string;
  section: string | null;
  exam_type: string;
  academic_year: string;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean;
}

interface Student {
  id: string;
  full_name: string;
  roll_number: number | null;
}

interface Mark {
  student_id: string;
  subject_id: string;
  theory_marks: number | null;
  practical_marks: number | null;
  total_marks: number | null;
  grade: string | null;
}

const TeacherExams = ({ teacherId }: TeacherExamsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<{ class: string; section: string | null; subject_id: string | null }[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Map<string, Mark>>(new Map());
  const [showMarksDialog, setShowMarksDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchExams(),
      fetchSubjects(),
      fetchAssignedClasses(),
    ]);
    setIsLoading(false);
  };

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, code, full_marks, pass_marks")
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
        .select("class, section, subject_id")
        .eq("teacher_id", teacherId);

      if (error) throw error;
      setAssignedClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudentsForExam = async (examId: string, cls: string, section: string | null) => {
    try {
      let query = supabase
        .from("students")
        .select("id, full_name, roll_number")
        .eq("class", cls)
        .eq("status", "active")
        .order("roll_number");

      if (section) {
        query = query.eq("section", section);
      }

      const { data: studentsData, error: studentsError } = await query;
      if (studentsError) throw studentsError;
      
      setStudents(studentsData || []);

      // Fetch existing marks
      const { data: marksData, error: marksError } = await supabase
        .from("exam_marks")
        .select("*")
        .eq("exam_id", examId);

      if (marksError) throw marksError;

      const marksMap = new Map<string, Mark>();
      marksData?.forEach((mark) => {
        const key = `${mark.student_id}_${mark.subject_id}`;
        marksMap.set(key, {
          student_id: mark.student_id,
          subject_id: mark.subject_id,
          theory_marks: mark.theory_marks,
          practical_marks: mark.practical_marks,
          total_marks: mark.total_marks,
          grade: mark.grade,
        });
      });

      setMarks(marksMap);
    } catch (error) {
      console.error("Error fetching students/marks:", error);
    }
  };

  const openMarksEntry = (exam: Exam, subject: Subject) => {
    setSelectedExam(exam);
    setSelectedSubject(subject);
    fetchStudentsForExam(exam.id, exam.class, exam.section);
    setShowMarksDialog(true);
  };

  const updateMark = (studentId: string, field: keyof Mark, value: number | null) => {
    if (!selectedSubject) return;

    const key = `${studentId}_${selectedSubject.id}`;
    setMarks((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(key) || {
        student_id: studentId,
        subject_id: selectedSubject.id,
        theory_marks: null,
        practical_marks: null,
        total_marks: null,
        grade: null,
      };
      
      const newMark = { ...existing, [field]: value };
      
      // Calculate total
      const theory = newMark.theory_marks || 0;
      const practical = newMark.practical_marks || 0;
      newMark.total_marks = theory + practical;
      
      // Calculate grade based on NEB grading using full_marks
      const fullMarks = selectedSubject.full_marks || 100;
      
      if (fullMarks > 0) {
        const percentage = (newMark.total_marks / fullMarks) * 100;
        if (percentage >= 90) newMark.grade = "A+";
        else if (percentage >= 80) newMark.grade = "A";
        else if (percentage >= 70) newMark.grade = "B+";
        else if (percentage >= 60) newMark.grade = "B";
        else if (percentage >= 50) newMark.grade = "C+";
        else if (percentage >= 40) newMark.grade = "C";
        else if (percentage >= 30) newMark.grade = "D+";
        else if (percentage >= 20) newMark.grade = "D";
        else newMark.grade = "NG";
      }
      
      updated.set(key, newMark);
      return updated;
    });
  };

  const saveMarks = async () => {
    if (!selectedExam || !selectedSubject || !teacherId) return;
    setIsSaving(true);

    try {
      const marksToSave = students.map((student) => {
        const key = `${student.id}_${selectedSubject.id}`;
        const mark = marks.get(key);
        return {
          exam_id: selectedExam.id,
          student_id: student.id,
          subject_id: selectedSubject.id,
          theory_marks: mark?.theory_marks || null,
          practical_marks: mark?.practical_marks || null,
          total_marks: mark?.total_marks || null,
          grade: mark?.grade || null,
          entered_by: teacherId,
        };
      }).filter((m) => m.theory_marks !== null || m.practical_marks !== null);

      // Delete existing marks for this exam/subject combo
      await supabase
        .from("exam_marks")
        .delete()
        .eq("exam_id", selectedExam.id)
        .eq("subject_id", selectedSubject.id);

      // Insert new marks
      if (marksToSave.length > 0) {
        const { error } = await supabase.from("exam_marks").insert(marksToSave);
        if (error) throw error;
      }

      toast({
        title: "Marks Saved",
        description: `Marks for ${selectedSubject.name} have been saved.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Filter exams for this teacher's classes
  const assignedClassNames = [...new Set(assignedClasses.map((a) => a.class))];
  const teacherExams = exams.filter((e) => assignedClassNames.includes(e.class));

  const upcomingExams = teacherExams.filter(
    (e) => e.start_date && new Date(e.start_date) >= new Date()
  );
  const pastExams = teacherExams.filter(
    (e) => e.start_date && new Date(e.start_date) < new Date()
  );

  // Get subjects this teacher can enter marks for
  const teacherSubjectIds = assignedClasses.map((a) => a.subject_id).filter(Boolean);
  const teacherSubjects = subjects.filter(
    (s) => teacherSubjectIds.includes(s.id) || assignedClasses.some((a) => !a.subject_id)
  );

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Exams & Marks Entry
          </CardTitle>
          <CardDescription>
            View exam schedules and enter marks for your subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingExams.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastExams.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {(activeTab === "upcoming" ? upcomingExams : pastExams).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No exams found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === "upcoming" ? upcomingExams : pastExams).map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{exam.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge>Class {exam.class}</Badge>
                          {exam.section && <Badge variant="outline">Section {exam.section}</Badge>}
                          <Badge variant="secondary">{exam.exam_type}</Badge>
                          {exam.is_published ? (
                            <Badge className="bg-green-500">Published</Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </div>
                        {exam.start_date && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(exam.start_date), "MMM d, yyyy")}
                            {exam.end_date && ` - ${format(new Date(exam.end_date), "MMM d, yyyy")}`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {teacherSubjects.length > 0 ? (
                          teacherSubjects.map((subject) => (
                            <Button
                              key={subject.id}
                              variant="outline"
                              size="sm"
                              onClick={() => openMarksEntry(exam, subject)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {subject.name}
                            </Button>
                          ))
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            No subjects assigned
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Entry Dialog */}
      <Dialog open={showMarksDialog} onOpenChange={setShowMarksDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Enter Marks: {selectedSubject?.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedExam?.title} - Class {selectedExam?.class}
              {selectedExam?.section && `-${selectedExam.section}`}
            </p>
          </DialogHeader>

          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                <span>Full Marks: {selectedSubject?.full_marks || 100}</span>
                <span>Pass Marks: {selectedSubject?.pass_marks || 0}</span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Theory Marks</TableHead>
                    <TableHead>Practical Marks</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const key = `${student.id}_${selectedSubject?.id}`;
                    const mark = marks.get(key);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.roll_number || "-"}</TableCell>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={100}
                            value={mark?.theory_marks ?? ""}
                            onChange={(e) => 
                              updateMark(student.id, "theory_marks", e.target.value ? parseFloat(e.target.value) : null)
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={100}
                            value={mark?.practical_marks ?? ""}
                            onChange={(e) => 
                              updateMark(student.id, "practical_marks", e.target.value ? parseFloat(e.target.value) : null)
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{mark?.total_marks ?? "-"}</span>
                        </TableCell>
                        <TableCell>
                          {mark?.grade ? (
                            <Badge
                              variant={
                                mark.grade === "NG" ? "destructive" : 
                                mark.grade.startsWith("A") ? "default" : "secondary"
                              }
                            >
                              {mark.grade}
                            </Badge>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-4">
                <Button onClick={saveMarks} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Marks
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherExams;
