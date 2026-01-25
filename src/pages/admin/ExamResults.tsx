import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calculator, FileText, Trophy, TrendingUp, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface StudentResult {
  student_id: string;
  student_name: string;
  roll_number: number | null;
  total_marks: number;
  total_full_marks: number;
  percentage: number;
  gpa: number;
  grade: string;
  subjects: {
    name: string;
    marks: number;
    full_marks: number;
    grade: string;
  }[];
  rank?: number;
}

interface Exam {
  id: string;
  title: string;
  exam_type: string;
  class: string;
  section: string | null;
  academic_year: string;
  is_published: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#22c55e",
  A: "#84cc16",
  "B+": "#eab308",
  B: "#f97316",
  "C+": "#f59e0b",
  C: "#ef4444",
  "D+": "#dc2626",
  D: "#991b1b",
  NG: "#6b7280",
};

const AdminExamResults = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  const fetchExamData = async () => {
    setLoading(true);

    // Fetch exam
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
    await calculateResults(examData);
    setLoading(false);
  };

  const calculateResults = async (examData: Exam) => {
    // Fetch all marks for this exam with student and subject info
    const { data: marksData } = await supabase
      .from("exam_marks")
      .select(`
        *,
        students!inner(id, full_name, roll_number),
        subjects!inner(id, name, full_marks, credit_hours)
      `)
      .eq("exam_id", examId);

    if (!marksData || marksData.length === 0) {
      setResults([]);
      return;
    }

    // Group marks by student
    const studentMarks: Record<string, any[]> = {};
    marksData.forEach((mark: any) => {
      const studentId = mark.student_id;
      if (!studentMarks[studentId]) {
        studentMarks[studentId] = [];
      }
      studentMarks[studentId].push(mark);
    });

    // Calculate results for each student
    const studentResults: StudentResult[] = Object.entries(studentMarks).map(([studentId, marks]) => {
      const studentInfo = marks[0].students;
      
      let totalMarks = 0;
      let totalFullMarks = 0;
      let weightedGradePoints = 0;
      let totalCredits = 0;

      const subjects = marks.map((mark: any) => {
        const obtained = mark.total_marks || 0;
        const fullMarks = mark.subjects.full_marks;
        const credits = mark.subjects.credit_hours || 4;

        totalMarks += obtained;
        totalFullMarks += fullMarks;
        weightedGradePoints += (mark.grade_point || 0) * credits;
        totalCredits += credits;

        return {
          name: mark.subjects.name,
          marks: obtained,
          full_marks: fullMarks,
          grade: mark.grade || "NG",
        };
      });

      const percentage = totalFullMarks > 0 ? (totalMarks / totalFullMarks) * 100 : 0;
      const gpa = totalCredits > 0 ? weightedGradePoints / totalCredits : 0;

      // Determine overall grade
      let grade = "NG";
      if (gpa >= 3.6) grade = "A+";
      else if (gpa >= 3.2) grade = "A";
      else if (gpa >= 2.8) grade = "B+";
      else if (gpa >= 2.4) grade = "B";
      else if (gpa >= 2.0) grade = "C+";
      else if (gpa >= 1.6) grade = "C";
      else if (gpa >= 1.2) grade = "D+";
      else if (gpa >= 0.8) grade = "D";

      return {
        student_id: studentId,
        student_name: studentInfo.full_name,
        roll_number: studentInfo.roll_number,
        total_marks: totalMarks,
        total_full_marks: totalFullMarks,
        percentage: Math.round(percentage * 100) / 100,
        gpa: Math.round(gpa * 100) / 100,
        grade,
        subjects,
      };
    });

    // Sort by GPA and assign ranks
    studentResults.sort((a, b) => b.gpa - a.gpa);
    studentResults.forEach((result, index) => {
      result.rank = index + 1;
    });

    // Re-sort by roll number for display
    studentResults.sort((a, b) => (a.roll_number || 0) - (b.roll_number || 0));

    setResults(studentResults);
  };

  const saveResults = async () => {
    setCalculating(true);

    const resultsToSave = results.map((result) => ({
      exam_id: examId,
      student_id: result.student_id,
      total_marks: result.total_marks,
      percentage: result.percentage,
      gpa: result.gpa,
      grade: result.grade,
      rank: result.rank,
      total_subjects: result.subjects.length,
      passed_subjects: result.subjects.filter((s) => s.grade !== "NG").length,
      result_status: result.subjects.every((s) => s.grade !== "NG") ? "pass" : "fail",
    }));

    const { error } = await supabase.from("student_results").upsert(resultsToSave, {
      onConflict: "exam_id,student_id",
    });

    if (error) {
      toast({ title: "Error saving results", variant: "destructive" });
    } else {
      toast({ title: "Results calculated and saved!" });
    }

    setCalculating(false);
  };

  const togglePublish = async () => {
    if (!exam) return;

    const { error } = await supabase
      .from("exams")
      .update({ is_published: !exam.is_published })
      .eq("id", examId);

    if (error) {
      toast({ title: "Error updating status", variant: "destructive" });
    } else {
      setExam({ ...exam, is_published: !exam.is_published });
      toast({ title: exam.is_published ? "Results unpublished" : "Results published!" });
    }
  };

  // Analytics data
  const gradeDistribution = results.reduce((acc, r) => {
    acc[r.grade] = (acc[r.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(gradeDistribution).map(([grade, count]) => ({
    name: grade,
    value: count,
    color: GRADE_COLORS[grade] || "#6b7280",
  }));

  const avgGPA = results.length > 0 ? results.reduce((sum, r) => sum + r.gpa, 0) / results.length : 0;
  const passCount = results.filter((r) => r.grade !== "NG" && r.grade !== "D").length;
  const topPerformer = results.find((r) => r.rank === 1);

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
        <title>Exam Results | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/exams")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{exam?.title} - Results</h1>
              <p className="text-muted-foreground">
                Class {exam?.class} {exam?.section && `- Section ${exam.section}`} | {exam?.academic_year}
              </p>
            </div>
            <Button onClick={saveResults} disabled={calculating} variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              {calculating ? "Calculating..." : "Calculate & Save"}
            </Button>
            <Button onClick={togglePublish} variant={exam?.is_published ? "destructive" : "default"}>
              {exam?.is_published ? "Unpublish" : "Publish Results"}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Average GPA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgGPA.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {results.length > 0 ? Math.round((passCount / results.length) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Top Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">{topPerformer?.student_name || "-"}</div>
                <div className="text-sm text-muted-foreground">GPA: {topPerformer?.gpa.toFixed(2) || "-"}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {results.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">GPA Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.slice().sort((a, b) => (a.roll_number || 0) - (b.roll_number || 0))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="roll_number" label={{ value: "Roll No.", position: "bottom" }} />
                        <YAxis domain={[0, 4]} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border rounded p-2 shadow-lg">
                                  <p className="font-medium">{data.student_name}</p>
                                  <p>GPA: {data.gpa.toFixed(2)}</p>
                                  <p>Rank: #{data.rank}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="gpa" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead className="w-12">Roll</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No marks entered yet. Enter marks first to see results.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((result) => (
                      <TableRow key={result.student_id}>
                        <TableCell>
                          <Badge
                            variant={result.rank === 1 ? "default" : result.rank === 2 ? "secondary" : "outline"}
                          >
                            #{result.rank}
                          </Badge>
                        </TableCell>
                        <TableCell>{result.roll_number || "-"}</TableCell>
                        <TableCell className="font-medium">{result.student_name}</TableCell>
                        <TableCell>
                          {result.total_marks} / {result.total_full_marks}
                        </TableCell>
                        <TableCell>{result.percentage.toFixed(1)}%</TableCell>
                        <TableCell className="font-bold">{result.gpa.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            style={{ backgroundColor: GRADE_COLORS[result.grade], color: "white" }}
                          >
                            {result.grade}
                          </Badge>
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

export default AdminExamResults;
