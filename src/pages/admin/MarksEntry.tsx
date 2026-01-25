import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Calculator } from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  roll_number: number | null;
  registration_number: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  full_marks: number;
  pass_marks: number;
  credit_hours: number;
}

interface ExamMark {
  id?: string;
  student_id: string;
  subject_id: string;
  theory_marks: number | null;
  practical_marks: number | null;
  total_marks: number | null;
  grade: string | null;
  grade_point: number | null;
}

interface Exam {
  id: string;
  title: string;
  exam_type: string;
  class: string;
  section: string | null;
  academic_year: string;
}

const MarksEntry = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [marks, setMarks] = useState<Record<string, ExamMark>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  useEffect(() => {
    if (exam && selectedSubject) {
      fetchMarks();
    }
  }, [exam, selectedSubject]);

  const fetchExamData = async () => {
    setLoading(true);

    // Fetch exam details
    const { data: examData, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError || !examData) {
      toast({ title: "Exam not found", variant: "destructive" });
      navigate("/admin/exams");
      return;
    }

    setExam(examData);

    // Fetch students for this class
    const { data: studentData } = await supabase
      .from("students")
      .select("id, full_name, roll_number, registration_number")
      .eq("class", examData.class)
      .eq("status", "active")
      .order("roll_number", { ascending: true });

    setStudents(studentData || []);

    // Fetch subjects
    const { data: subjectData } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    setSubjects(subjectData || []);
    if (subjectData && subjectData.length > 0) {
      setSelectedSubject(subjectData[0].id);
    }

    setLoading(false);
  };

  const fetchMarks = async () => {
    const { data } = await supabase
      .from("exam_marks")
      .select("*")
      .eq("exam_id", examId)
      .eq("subject_id", selectedSubject);

    const marksMap: Record<string, ExamMark> = {};
    students.forEach((student) => {
      const existingMark = data?.find((m) => m.student_id === student.id);
      marksMap[student.id] = existingMark || {
        student_id: student.id,
        subject_id: selectedSubject,
        theory_marks: null,
        practical_marks: null,
        total_marks: null,
        grade: null,
        grade_point: null,
      };
    });
    setMarks(marksMap);
  };

  const calculateGrade = (marks: number, fullMarks: number): { grade: string; gradePoint: number } => {
    const percentage = (marks / fullMarks) * 100;

    if (percentage >= 90) return { grade: "A+", gradePoint: 4.0 };
    if (percentage >= 80) return { grade: "A", gradePoint: 3.6 };
    if (percentage >= 70) return { grade: "B+", gradePoint: 3.2 };
    if (percentage >= 60) return { grade: "B", gradePoint: 2.8 };
    if (percentage >= 50) return { grade: "C+", gradePoint: 2.4 };
    if (percentage >= 40) return { grade: "C", gradePoint: 2.0 };
    if (percentage >= 30) return { grade: "D+", gradePoint: 1.6 };
    if (percentage >= 20) return { grade: "D", gradePoint: 1.2 };
    return { grade: "NG", gradePoint: 0.0 };
  };

  const handleMarksChange = (studentId: string, field: "theory_marks" | "practical_marks", value: string) => {
    const numValue = value === "" ? null : Number(value);
    const subject = subjects.find((s) => s.id === selectedSubject);

    setMarks((prev) => {
      const current = prev[studentId];
      const newTheory = field === "theory_marks" ? numValue : current.theory_marks;
      const newPractical = field === "practical_marks" ? numValue : current.practical_marks;
      const total = (newTheory || 0) + (newPractical || 0);

      const { grade, gradePoint } = subject ? calculateGrade(total, subject.full_marks) : { grade: null, gradePoint: null };

      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: numValue,
          total_marks: total,
          grade,
          grade_point: gradePoint,
        },
      };
    });
  };

  const saveMarks = async () => {
    setSaving(true);

    const marksToSave = Object.values(marks).map((mark) => ({
      exam_id: examId,
      student_id: mark.student_id,
      subject_id: selectedSubject,
      theory_marks: mark.theory_marks,
      practical_marks: mark.practical_marks,
      total_marks: mark.total_marks,
      grade: mark.grade,
      grade_point: mark.grade_point,
    }));

    const { error } = await supabase
      .from("exam_marks")
      .upsert(marksToSave, {
        onConflict: "exam_id,student_id,subject_id",
      });

    if (error) {
      toast({ title: "Error saving marks", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marks saved successfully" });
    }

    setSaving(false);
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Enter Marks | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/exams")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{exam?.title}</h1>
              <p className="text-muted-foreground">
                Class {exam?.class} {exam?.section && `- Section ${exam.section}`} | {exam?.academic_year}
              </p>
            </div>
            <Button onClick={saveMarks} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Marks"}
            </Button>
          </div>

          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Subject</CardTitle>
              <CardDescription>Choose a subject to enter marks for students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentSubject && (
                  <div className="flex gap-2">
                    <Badge variant="outline">Full Marks: {currentSubject.full_marks}</Badge>
                    <Badge variant="outline">Pass Marks: {currentSubject.pass_marks}</Badge>
                    <Badge variant="outline">Credit: {currentSubject.credit_hours}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Marks Entry Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Roll</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-28">Theory</TableHead>
                    <TableHead className="w-28">Practical</TableHead>
                    <TableHead className="w-20">Total</TableHead>
                    <TableHead className="w-16">Grade</TableHead>
                    <TableHead className="w-16">GP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No students found for this class
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => {
                      const mark = marks[student.id];
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.roll_number || "-"}</TableCell>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={currentSubject?.full_marks || 100}
                              value={mark?.theory_marks ?? ""}
                              onChange={(e) => handleMarksChange(student.id, "theory_marks", e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={currentSubject?.full_marks || 100}
                              value={mark?.practical_marks ?? ""}
                              onChange={(e) => handleMarksChange(student.id, "practical_marks", e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{mark?.total_marks ?? "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                mark?.grade === "NG"
                                  ? "destructive"
                                  : mark?.grade?.startsWith("A")
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {mark?.grade || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>{mark?.grade_point?.toFixed(1) || "-"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* NEB Grade Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                NEB Grading System Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-9 gap-2 text-xs">
                {[
                  { grade: "A+", range: "90-100", gp: "4.0" },
                  { grade: "A", range: "80-89", gp: "3.6" },
                  { grade: "B+", range: "70-79", gp: "3.2" },
                  { grade: "B", range: "60-69", gp: "2.8" },
                  { grade: "C+", range: "50-59", gp: "2.4" },
                  { grade: "C", range: "40-49", gp: "2.0" },
                  { grade: "D+", range: "30-39", gp: "1.6" },
                  { grade: "D", range: "20-29", gp: "1.2" },
                  { grade: "NG", range: "0-19", gp: "0.0" },
                ].map((item) => (
                  <div key={item.grade} className="text-center p-2 bg-muted rounded">
                    <div className="font-bold">{item.grade}</div>
                    <div className="text-muted-foreground">{item.range}%</div>
                    <div>GP: {item.gp}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default MarksEntry;
