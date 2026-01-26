import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Clock,
  Bell,
  TrendingUp,
  AlertTriangle,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface TeacherProfile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  department: string | null;
  photo_url: string | null;
  qualification: string | null;
}

interface TeacherOverviewProps {
  teacherProfile: TeacherProfile | null;
  onNavigate: (tab: string) => void;
}

interface TeacherStats {
  totalStudents: number;
  classesAssigned: number;
  pendingAttendance: number;
  homeworkToReview: number;
  upcomingExams: number;
  todayClasses: number;
}

interface Assignment {
  id: string;
  class: string;
  section: string | null;
  subject: { name: string } | null;
  is_class_teacher: boolean;
}

interface TimetableEntry {
  id: string;
  class: string;
  section: string | null;
  period_number: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject: { name: string } | null;
}

const TeacherOverview = ({ teacherProfile, onNavigate }: TeacherOverviewProps) => {
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    classesAssigned: 0,
    pendingAttendance: 0,
    homeworkToReview: 0,
    upcomingExams: 0,
    todayClasses: 0,
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);

  useEffect(() => {
    if (teacherProfile?.id) {
      fetchStats();
      fetchAssignments();
      fetchTodaySchedule();
      fetchPendingTasks();
      fetchNotices();
    }
  }, [teacherProfile?.id]);

  const fetchStats = async () => {
    if (!teacherProfile?.id) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const dayOfWeek = new Date().getDay();

      // Get assigned classes
      const { data: assignmentsData } = await supabase
        .from("teacher_assignments")
        .select("class, section")
        .eq("teacher_id", teacherProfile.id);

      const classes = assignmentsData?.map((a) => a.class) || [];
      const uniqueClasses = [...new Set(classes)];

      // Count students in assigned classes
      let totalStudents = 0;
      if (uniqueClasses.length > 0) {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .in("class", uniqueClasses)
          .eq("status", "active");
        totalStudents = count || 0;
      }

      // Pending homework submissions to review
      const { count: homeworkToReview } = await supabase
        .from("homework_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted");

      // Upcoming exams
      const { count: upcomingExams } = await supabase
        .from("exams")
        .select("*", { count: "exact", head: true })
        .gte("start_date", today)
        .in("class", uniqueClasses);

      // Today's classes
      const { count: todayClasses } = await supabase
        .from("teacher_timetable")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacherProfile.id)
        .eq("day_of_week", dayOfWeek);

      setStats({
        totalStudents,
        classesAssigned: uniqueClasses.length,
        pendingAttendance: 0, // Would need to check if attendance marked for today
        homeworkToReview: homeworkToReview || 0,
        upcomingExams: upcomingExams || 0,
        todayClasses: todayClasses || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAssignments = async () => {
    if (!teacherProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from("teacher_assignments")
        .select(`
          id,
          class,
          section,
          is_class_teacher,
          subject:subject_id (name)
        `)
        .eq("teacher_id", teacherProfile.id);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchTodaySchedule = async () => {
    if (!teacherProfile?.id) return;

    try {
      const dayOfWeek = new Date().getDay();
      const { data, error } = await supabase
        .from("teacher_timetable")
        .select(`
          id,
          class,
          section,
          period_number,
          start_time,
          end_time,
          room,
          subject:subject_id (name)
        `)
        .eq("teacher_id", teacherProfile.id)
        .eq("day_of_week", dayOfWeek)
        .order("period_number");

      if (error) throw error;
      setTodaySchedule(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const fetchPendingTasks = async () => {
    if (!teacherProfile?.id) return;

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Get homework due soon
      const { data: homework } = await supabase
        .from("homework")
        .select("id, title, due_date, class")
        .eq("teacher_id", teacherProfile.id)
        .gte("due_date", today)
        .order("due_date")
        .limit(5);

      const tasks = homework?.map((h) => ({
        id: h.id,
        type: "homework",
        title: h.title,
        subtitle: `Class ${h.class} • Due: ${format(new Date(h.due_date), "MMM d")}`,
      })) || [];

      setPendingTasks(tasks);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("id, title, created_at, category")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white/30">
              <AvatarImage src={teacherProfile?.photo_url || ""} />
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {teacherProfile?.full_name?.charAt(0) || "T"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                Welcome, {teacherProfile?.full_name || "Teacher"}!
              </h2>
              <p className="opacity-90">
                {teacherProfile?.subject && `${teacherProfile.subject} Teacher`}
                {teacherProfile?.department && ` • ${teacherProfile.department}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {teacherProfile?.employee_id}
                </Badge>
                {teacherProfile?.qualification && (
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {teacherProfile.qualification}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-sm opacity-75">{format(new Date(), "EEEE")}</p>
              <p className="text-2xl font-bold">{format(new Date(), "MMMM d, yyyy")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("students")}>
          <CardContent className="p-4">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("timetable")}>
          <CardContent className="p-4">
            <Calendar className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold">{stats.classesAssigned}</p>
            <p className="text-xs text-muted-foreground">Classes Assigned</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("attendance")}>
          <CardContent className="p-4">
            <ClipboardCheck className="w-6 h-6 text-amber-600 mb-2" />
            <p className="text-2xl font-bold">{stats.todayClasses}</p>
            <p className="text-xs text-muted-foreground">Today's Classes</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("homework")}>
          <CardContent className="p-4">
            <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{stats.homeworkToReview}</p>
            <p className="text-xs text-muted-foreground">To Review</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("exams")}>
          <CardContent className="p-4">
            <FileText className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-2xl font-bold">{stats.upcomingExams}</p>
            <p className="text-xs text-muted-foreground">Upcoming Exams</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate("analytics")}>
          <CardContent className="p-4">
            <TrendingUp className="w-6 h-6 text-cyan-600 mb-2" />
            <p className="text-2xl font-bold">View</p>
            <p className="text-xs text-muted-foreground">Analytics</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{entry.period_number}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {(entry.subject as any)?.name || "Subject"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Class {entry.class}{entry.section ? `-${entry.section}` : ""} 
                        {entry.room && ` • Room ${entry.room}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {entry.start_time?.slice(0, 5)} - {entry.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No classes assigned</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        Class {assignment.class}
                        {assignment.section && `-${assignment.section}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(assignment.subject as any)?.name || "General"}
                      </p>
                    </div>
                    {assignment.is_class_teacher && (
                      <Badge variant="secondary" className="text-xs">
                        Class Teacher
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent announcements</p>
            ) : (
              <div className="space-y-2">
                {recentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <Bell className="w-4 h-4 mt-0.5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notice.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {notice.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notice.created_at), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onNavigate("attendance")}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span className="text-xs">Mark Attendance</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onNavigate("homework")}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Create Homework</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onNavigate("exams")}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Enter Marks</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onNavigate("students")}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">View Students</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onNavigate("questions")}
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs">Question Bank</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onNavigate("messages")}
            >
              <Bell className="w-5 h-5" />
              <span className="text-xs">Send Message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherOverview;
