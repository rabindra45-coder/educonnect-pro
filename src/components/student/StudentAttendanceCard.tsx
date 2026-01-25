import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Loader2
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from "date-fns";

interface StudentAttendanceCardProps {
  studentId: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  check_in_time: string | null;
  remarks: string | null;
}

const StudentAttendanceCard = ({ studentId }: StudentAttendanceCardProps) => {
  const currentMonth = format(new Date(), "yyyy-MM");
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());
  const workingDays = eachDayOfInterval({ start: startDate, end: endDate })
    .filter(date => !isWeekend(date) && date <= new Date());

  // Fetch current month attendance
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["student-attendance", studentId, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("id, date, status, check_in_time, remarks")
        .eq("student_id", studentId)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!studentId,
  });

  // Fetch last 3 months for trend
  const { data: recentAttendance = [] } = useQuery({
    queryKey: ["student-attendance-trend", studentId],
    queryFn: async () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data, error } = await supabase
        .from("attendance")
        .select("id, date, status")
        .eq("student_id", studentId)
        .gte("date", format(threeMonthsAgo, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!studentId,
  });

  const stats = {
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
    late: attendance.filter(a => a.status === "late").length,
    excused: attendance.filter(a => a.status === "excused").length,
    total: workingDays.length,
  };

  const attendancePercentage = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      present: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
      absent: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
      late: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
      excused: { color: "bg-blue-100 text-blue-800", icon: <FileText className="w-3 h-3" /> },
    };
    const v = variants[status] || variants.present;
    return (
      <Badge className={`${v.color} flex items-center gap-1`}>
        {v.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAttendanceGrade = () => {
    if (attendancePercentage >= 90) return { label: "Excellent", color: "text-green-600" };
    if (attendancePercentage >= 75) return { label: "Good", color: "text-blue-600" };
    if (attendancePercentage >= 60) return { label: "Average", color: "text-yellow-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
  };

  const grade = getAttendanceGrade();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attendance Overview - {format(new Date(), "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Attendance Percentage */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${attendancePercentage * 3.52} 352`}
                    className="text-primary"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{attendancePercentage}%</span>
                  <span className="text-xs text-muted-foreground">Attendance</span>
                </div>
              </div>
              <div className={`mt-4 flex items-center gap-2 ${grade.color}`}>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{grade.label}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-muted-foreground">Present</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-muted-foreground">Absent</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-muted-foreground">Late</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Excused</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          </div>

          {/* Working Days Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Working Days Progress</span>
              <span className="text-sm font-medium">
                {attendance.length} / {stats.total} days marked
              </span>
            </div>
            <Progress 
              value={(attendance.length / stats.total) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records for this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.slice(0, 10).map((record) => (
                <div 
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {format(new Date(record.date), "d")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {format(new Date(record.date), "EEEE, MMMM d")}
                      </p>
                      {record.check_in_time && (
                        <p className="text-xs text-muted-foreground">
                          Check-in: {record.check_in_time.slice(0, 5)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))}
              {attendance.length > 10 && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing latest 10 records
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendanceCard;
