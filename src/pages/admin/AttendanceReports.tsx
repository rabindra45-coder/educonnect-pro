import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Download, 
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  FileText,
  Printer
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns";
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
  Legend,
} from "recharts";

interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  status: string;
}

interface StudentWithAttendance {
  id: string;
  full_name: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  registration_number: string;
  guardian_email: string | null;
  attendance: AttendanceRecord[];
}

const AttendanceReports = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedClass, setSelectedClass] = useState<string>("");

  const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  const startDate = startOfMonth(new Date(selectedMonth));
  const endDate = endOfMonth(new Date(selectedMonth));
  const workingDays = eachDayOfInterval({ start: startDate, end: endDate })
    .filter(date => !isWeekend(date) && date <= new Date());

  // Fetch students with their attendance for the month
  const { data: studentsWithAttendance = [], isLoading } = useQuery({
    queryKey: ["attendance-report", selectedMonth, selectedClass],
    queryFn: async () => {
      if (!selectedClass) return [];

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id, full_name, class, section, roll_number, registration_number, guardian_email")
        .eq("class", selectedClass)
        .eq("status", "active")
        .order("roll_number");

      if (studentsError) throw studentsError;

      const { data: attendance, error: attendanceError } = await supabase
        .from("attendance")
        .select("id, student_id, date, status")
        .in("student_id", students.map(s => s.id))
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (attendanceError) throw attendanceError;

      return students.map(student => ({
        ...student,
        attendance: attendance.filter(a => a.student_id === student.id),
      })) as StudentWithAttendance[];
    },
    enabled: !!selectedClass,
  });

  // Calculate statistics
  const calculateStats = (student: StudentWithAttendance) => {
    const present = student.attendance.filter(a => a.status === "present").length;
    const absent = student.attendance.filter(a => a.status === "absent").length;
    const late = student.attendance.filter(a => a.status === "late").length;
    const excused = student.attendance.filter(a => a.status === "excused").length;
    const total = workingDays.length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, late, excused, total, percentage };
  };

  const overallStats = {
    totalStudents: studentsWithAttendance.length,
    avgAttendance: studentsWithAttendance.length > 0
      ? Math.round(
          studentsWithAttendance.reduce((sum, s) => sum + calculateStats(s).percentage, 0) / 
          studentsWithAttendance.length
        )
      : 0,
    perfectAttendance: studentsWithAttendance.filter(s => calculateStats(s).absent === 0).length,
    lowAttendance: studentsWithAttendance.filter(s => calculateStats(s).percentage < 75).length,
  };

  // Chart data
  const pieData = [
    { name: "Present", value: studentsWithAttendance.reduce((sum, s) => sum + calculateStats(s).present, 0), color: "#22c55e" },
    { name: "Absent", value: studentsWithAttendance.reduce((sum, s) => sum + calculateStats(s).absent, 0), color: "#ef4444" },
    { name: "Late", value: studentsWithAttendance.reduce((sum, s) => sum + calculateStats(s).late, 0), color: "#f59e0b" },
    { name: "Excused", value: studentsWithAttendance.reduce((sum, s) => sum + calculateStats(s).excused, 0), color: "#3b82f6" },
  ].filter(d => d.value > 0);

  const barData = studentsWithAttendance.slice(0, 15).map(s => ({
    name: s.full_name.split(" ")[0],
    attendance: calculateStats(s).percentage,
  }));

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (percentage >= 75) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ["Roll No", "Name", "Registration", "Present", "Absent", "Late", "Excused", "Total Days", "Percentage"];
    const rows = studentsWithAttendance.map(s => {
      const stats = calculateStats(s);
      return [
        s.roll_number || "",
        s.full_name,
        s.registration_number,
        stats.present,
        stats.absent,
        stats.late,
        stats.excused,
        stats.total,
        `${stats.percentage}%`,
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${selectedClass}-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Attendance Reports</h1>
            <p className="text-muted-foreground">Monthly attendance analysis and reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={!selectedClass} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Month</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c} value={c}>Class {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <p className="text-sm text-muted-foreground">
                  Working Days: <span className="font-medium">{workingDays.length}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedClass && !isLoading && studentsWithAttendance.length > 0 && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.totalStudents}</p>
                      <p className="text-xs text-muted-foreground">Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.avgAttendance}%</p>
                      <p className="text-xs text-muted-foreground">Avg Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.perfectAttendance}</p>
                      <p className="text-xs text-muted-foreground">100% Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{overallStats.lowAttendance}</p>
                      <p className="text-xs text-muted-foreground">Below 75%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Distribution</CardTitle>
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
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Attendance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                        <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Report Table */}
            <Card className="print:shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Detailed Attendance Report
                </CardTitle>
                <CardDescription>
                  Class {selectedClass} - {format(new Date(selectedMonth), "MMMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Present</TableHead>
                      <TableHead className="text-center">Absent</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Excused</TableHead>
                      <TableHead>Attendance %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsWithAttendance.map((student) => {
                      const stats = calculateStats(student);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.roll_number || "-"}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {student.registration_number}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-medium">{stats.present}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-red-600 font-medium">{stats.absent}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-yellow-600 font-medium">{stats.late}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-blue-600 font-medium">{stats.excused}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={stats.percentage} className="w-16 h-2" />
                              <span className="text-sm font-medium">{stats.percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAttendanceBadge(stats.percentage)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {selectedClass && isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!selectedClass && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a class to view attendance reports</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AttendanceReports;
