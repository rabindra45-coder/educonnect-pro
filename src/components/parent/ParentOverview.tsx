import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";

interface Child {
  id: string;
  full_name: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  photo_url: string | null;
  status: string | null;
}

interface OverviewStats {
  children: Child[];
  totalDues: number;
  overdueFees: number;
  todayAttendance: { studentId: string; status: string }[];
  upcomingHomework: number;
  recentNotices: any[];
}

const ParentOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats>({
    children: [],
    totalDues: 0,
    overdueFees: 0,
    todayAttendance: [],
    upcomingHomework: 0,
    recentNotices: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOverview();
  }, [user]);

  const fetchOverview = async () => {
    try {
      // Get parent record
      const { data: parentData } = await supabase
        .from("parents")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!parentData) {
        setIsLoading(false);
        return;
      }

      // Get linked children
      const { data: links } = await supabase
        .from("parent_students")
        .select("student_id")
        .eq("parent_id", parentData.id);

      const studentIds = links?.map((l) => l.student_id) || [];

      if (studentIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [childrenRes, feesRes, attendanceRes, homeworkRes, noticesRes] = await Promise.all([
        supabase
          .from("students")
          .select("id, full_name, class, section, roll_number, photo_url, status")
          .in("id", studentIds),
        supabase
          .from("student_fees")
          .select("balance, status")
          .in("student_id", studentIds)
          .in("status", ["pending", "partial", "overdue"]),
        supabase
          .from("attendance")
          .select("student_id, status")
          .in("student_id", studentIds)
          .eq("date", new Date().toISOString().split("T")[0]),
        supabase
          .from("homework")
          .select("id")
          .gte("due_date", new Date().toISOString().split("T")[0])
          .eq("is_published", true),
        supabase
          .from("notices")
          .select("id, title, created_at, category")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const fees = feesRes.data || [];
      const totalDues = fees.reduce((sum, f) => sum + Number(f.balance || 0), 0);
      const overdueFees = fees.filter((f) => f.status === "overdue").length;

      setStats({
        children: childrenRes.data || [],
        totalDues,
        overdueFees,
        todayAttendance: (attendanceRes.data || []).map((a) => ({ studentId: a.student_id, status: a.status })),
        upcomingHomework: homeworkRes.data?.length || 0,
        recentNotices: noticesRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching parent overview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (stats.children.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
          <p className="text-muted-foreground">
            Your account is not linked to any students yet. Please contact the school administration to link your children's profiles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAttendanceStatus = (studentId: string) => {
    const record = stats.todayAttendance.find((a) => a.studentId === studentId);
    if (!record) return { label: "Not Marked", color: "bg-gray-100 text-gray-600" };
    if (record.status === "present") return { label: "Present", color: "bg-green-100 text-green-700" };
    if (record.status === "absent") return { label: "Absent", color: "bg-red-100 text-red-700" };
    if (record.status === "late") return { label: "Late", color: "bg-amber-100 text-amber-700" };
    return { label: record.status, color: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome Back! 👋</h1>
        <p className="text-muted-foreground">Monitor your children's academic progress and school activities.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <Users className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-teal-100 text-xs">Children</p>
            <p className="text-2xl font-bold">{stats.children.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <BookOpen className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-blue-100 text-xs">Homework Due</p>
            <p className="text-2xl font-bold">{stats.upcomingHomework}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <Wallet className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-amber-100 text-xs">Pending Dues</p>
            <p className="text-2xl font-bold">रू {stats.totalDues.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className={`text-white ${stats.overdueFees > 0 ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-green-500 to-green-600"}`}>
          <CardContent className="p-4">
            {stats.overdueFees > 0 ? <AlertTriangle className="w-5 h-5 mb-2 opacity-80" /> : <TrendingUp className="w-5 h-5 mb-2 opacity-80" />}
            <p className="text-white/80 text-xs">Overdue</p>
            <p className="text-2xl font-bold">{stats.overdueFees}</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.children.map((child) => {
          const attendance = getAttendanceStatus(child.id);
          const initials = child.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-teal-200">
                    <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{child.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Class {child.class}
                      {child.section && ` - ${child.section}`}
                      {child.roll_number && ` | Roll: ${child.roll_number}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {child.status || "active"}
                      </Badge>
                      <Badge className={`text-xs ${attendance.color}`}>
                        Today: {attendance.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Notices */}
      {stats.recentNotices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📢 Recent Notices</CardTitle>
            <CardDescription>Latest school announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentNotices.map((notice: any) => (
                <div key={notice.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notice.created_at).toLocaleDateString()} • {notice.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParentOverview;
