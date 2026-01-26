import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Loader2, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface TeacherAnalyticsProps {
  teacherId: string | undefined;
}

interface SubjectPerformance {
  subject: string;
  average: number;
  passed: number;
  failed: number;
}

interface StudentPerformance {
  student_name: string;
  roll_number: number | null;
  average: number;
  trend: "up" | "down" | "stable";
}

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

const TeacherAnalytics = ({ teacherId }: TeacherAnalyticsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    passPercentage: 0,
    topPerformers: 0,
  });

  useEffect(() => {
    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchAnalytics();
    }
  }, [teacherId, selectedExam, selectedClass]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchExams(), fetchAssignedClasses()]);
    setIsLoading(false);
  };

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchAssignedClasses = async () => {
    if (!teacherId) return;

    try {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select("class")
        .eq("teacher_id", teacherId);

      if (error) throw error;
      const classes = [...new Set(data?.map((d) => d.class) || [])];
      setAssignedClasses(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchAnalytics = async () => {
    if (!teacherId) return;

    try {
      // Fetch exam marks for analytics
      let query = supabase
        .from("exam_marks")
        .select(`
          total_marks,
          grade,
          student:student_id (full_name, roll_number, class),
          subject:subject_id (name, full_marks, pass_marks),
          exam:exam_id (title, class)
        `);

      if (selectedExam !== "all") {
        query = query.eq("exam_id", selectedExam);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by class if selected
      let filteredData = data || [];
      if (selectedClass !== "all") {
        filteredData = filteredData.filter(
          (d: any) => d.exam?.class === selectedClass || d.student?.class === selectedClass
        );
      }

      // Calculate subject performance
      const subjectMap = new Map<string, { total: number; count: number; passed: number; failed: number }>();
      filteredData.forEach((mark: any) => {
        const subjectName = mark.subject?.name || "Unknown";
        const existing = subjectMap.get(subjectName) || { total: 0, count: 0, passed: 0, failed: 0 };
        const isPassed = mark.grade && mark.grade !== "NG";
        
        subjectMap.set(subjectName, {
          total: existing.total + (mark.total_marks || 0),
          count: existing.count + 1,
          passed: existing.passed + (isPassed ? 1 : 0),
          failed: existing.failed + (!isPassed ? 1 : 0),
        });
      });

      const subjectPerf: SubjectPerformance[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject,
        average: Math.round(data.count > 0 ? data.total / data.count : 0),
        passed: data.passed,
        failed: data.failed,
      }));

      setSubjectPerformance(subjectPerf);

      // Calculate student performance
      const studentMap = new Map<string, { name: string; roll: number | null; total: number; count: number }>();
      filteredData.forEach((mark: any) => {
        const studentId = mark.student?.full_name || "Unknown";
        const existing = studentMap.get(studentId) || { 
          name: mark.student?.full_name || "Unknown",
          roll: mark.student?.roll_number,
          total: 0, 
          count: 0 
        };
        
        studentMap.set(studentId, {
          ...existing,
          total: existing.total + (mark.total_marks || 0),
          count: existing.count + 1,
        });
      });

      const studentPerf: StudentPerformance[] = Array.from(studentMap.values())
        .map((data) => ({
          student_name: data.name,
          roll_number: data.roll,
          average: Math.round(data.count > 0 ? data.total / data.count : 0),
          trend: "stable" as const,
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      setStudentPerformance(studentPerf);

      // Calculate overall stats
      const totalMarks = filteredData.reduce((sum: number, m: any) => sum + (m.total_marks || 0), 0);
      const passedCount = filteredData.filter((m: any) => m.grade && m.grade !== "NG").length;
      const topCount = filteredData.filter((m: any) => m.grade && ["A+", "A"].includes(m.grade)).length;

      setStats({
        totalStudents: studentMap.size,
        averageScore: Math.round(filteredData.length > 0 ? totalMarks / filteredData.length : 0),
        passPercentage: Math.round(filteredData.length > 0 ? (passedCount / filteredData.length) * 100 : 0),
        topPerformers: topCount,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

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
            <BarChart3 className="w-5 h-5" />
            Student Performance Analytics
          </CardTitle>
          <CardDescription>
            Analyze student performance across subjects and exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {assignedClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Students Analyzed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <BarChart3 className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{stats.averageScore}</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
                <p className="text-2xl font-bold">{stats.passPercentage}%</p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{stats.topPerformers}</p>
                <p className="text-xs text-muted-foreground">Top Performers (A/A+)</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject-wise Average</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pass/Fail Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Passed", value: subjectPerformance.reduce((sum, s) => sum + s.passed, 0) },
                      { name: "Failed", value: subjectPerformance.reduce((sum, s) => sum + s.failed, 0) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Students</CardTitle>
        </CardHeader>
        <CardContent>
          {studentPerformance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          ) : (
            <div className="space-y-2">
              {studentPerformance.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Roll: {student.roll_number || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{student.average}</p>
                    <p className="text-xs text-muted-foreground">avg marks</p>
                  </div>
                  <div>
                    {student.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {student.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {student.trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAnalytics;
