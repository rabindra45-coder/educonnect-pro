import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, GraduationCap, TrendingUp, Award, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const AcademicProgress = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [exams, setExams] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  useEffect(() => {
    if (selectedChild) fetchAcademicData();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data: parentData } = await supabase.from("parents").select("id").eq("user_id", user!.id).maybeSingle();
      if (!parentData) { setIsLoading(false); return; }

      const { data: links } = await supabase.from("parent_students").select("student_id").eq("parent_id", parentData.id);
      const ids = links?.map((l) => l.student_id) || [];
      if (ids.length === 0) { setIsLoading(false); return; }

      const { data: students } = await supabase.from("students").select("id, full_name, class").in("id", ids);
      setChildren(students || []);
      if (students && students.length > 0) setSelectedChild(students[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      const child = children.find((c) => c.id === selectedChild);
      if (!child) return;

      const [examsRes, marksRes] = await Promise.all([
        supabase.from("exams").select("*").eq("class", child.class).eq("is_published", true).order("start_date", { ascending: false }),
        supabase.from("exam_marks").select("*, subject:subject_id(name, credit_hours), exam:exam_id(title, exam_type)").eq("student_id", selectedChild),
      ]);

      setExams(examsRes.data || []);
      setMarks(marksRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  }

  if (children.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold">No Academic Data</h3>
          <p className="text-muted-foreground">No children linked to view academic progress.</p>
        </CardContent>
      </Card>
    );
  }

  // Process data for charts
  const subjectPerformance = marks
    .filter((m) => m.subject)
    .reduce((acc: any[], m) => {
      const existing = acc.find((a) => a.subject === m.subject?.name);
      if (existing) {
        existing.marks = Math.max(existing.marks, Number(m.total_marks || 0));
      } else {
        acc.push({ subject: m.subject?.name || "Unknown", marks: Number(m.total_marks || 0), fullMarks: 100 });
      }
      return acc;
    }, []);

  const avgGPA = marks.length > 0
    ? (marks.reduce((sum, m) => sum + Number(m.grade_point || 0), 0) / marks.length).toFixed(2)
    : "N/A";

  const highestMark = marks.reduce((max, m) => Math.max(max, Number(m.total_marks || 0)), 0);
  const lowestMark = marks.length > 0 ? marks.reduce((min, m) => Math.min(min, Number(m.total_marks || 100)), 100) : 0;

  const getGradeColor = (grade: string) => {
    if (["A+", "A"].includes(grade)) return "bg-green-100 text-green-700";
    if (["B+", "B"].includes(grade)) return "bg-blue-100 text-blue-700";
    if (["C+", "C"].includes(grade)) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academic Progress</h1>
          <p className="text-muted-foreground">Track exam results and performance trends</p>
        </div>
        {children.length > 1 && (
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto text-teal-600 mb-1" />
            <p className="text-2xl font-bold text-teal-600">{avgGPA}</p>
            <p className="text-xs text-muted-foreground">Avg GPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-600">{highestMark}</p>
            <p className="text-xs text-muted-foreground">Highest Mark</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold text-blue-600">{exams.length}</p>
            <p className="text-xs text-muted-foreground">Exams Taken</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <GraduationCap className="w-6 h-6 mx-auto text-purple-600 mb-1" />
            <p className="text-2xl font-bold text-purple-600">{marks.length}</p>
            <p className="text-xs text-muted-foreground">Subjects Graded</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {subjectPerformance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="marks" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strength Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={subjectPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Marks" dataKey="marks" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Marks Table */}
      {marks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Theory</TableHead>
                    <TableHead>Practical</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>GPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marks.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{m.exam?.title || "-"}</TableCell>
                      <TableCell className="font-medium text-sm">{m.subject?.name || "-"}</TableCell>
                      <TableCell>{m.theory_marks ?? "-"}</TableCell>
                      <TableCell>{m.practical_marks ?? "-"}</TableCell>
                      <TableCell className="font-bold">{m.total_marks ?? "-"}</TableCell>
                      <TableCell>
                        <Badge className={`${getGradeColor(m.grade || "NG")} text-xs`}>{m.grade || "NG"}</Badge>
                      </TableCell>
                      <TableCell>{m.grade_point ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicProgress;
