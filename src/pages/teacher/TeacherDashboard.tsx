import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  LogOut,
  Home,
  Loader2,
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  ClipboardCheck,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  GraduationCap,
} from "lucide-react";
import schoolLogo from "@/assets/logo.png";
import TeacherOverview from "@/components/teacher/TeacherOverview";
import TeacherStudents from "@/components/teacher/TeacherStudents";
import TeacherAttendance from "@/components/teacher/TeacherAttendance";
import TeacherHomework from "@/components/teacher/TeacherHomework";
import TeacherExams from "@/components/teacher/TeacherExams";
import TeacherTimetable from "@/components/teacher/TeacherTimetable";
import TeacherQuestionBank from "@/components/teacher/TeacherQuestionBank";
import TeacherAnalytics from "@/components/teacher/TeacherAnalytics";
import TeacherMessages from "@/components/teacher/TeacherMessages";
import TeacherSettings from "@/components/teacher/TeacherSettings";

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

const TeacherDashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/teacher/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkTeacherRole();
      fetchTeacherProfile();
      fetchNotificationCount();
    }
  }, [user]);

  const checkTeacherRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .in("role", ["super_admin", "admin", "teacher"]);

      if (error) throw error;
      setIsTeacher(data && data.length > 0);
    } catch (error) {
      console.error("Error checking role:", error);
      setIsTeacher(false);
    } finally {
      setIsCheckingRole(false);
    }
  };

  const fetchTeacherProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      setTeacherProfile(data);
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
    }
  };

  const fetchNotificationCount = async () => {
    // Count pending tasks as notifications
    try {
      const today = new Date().toISOString().split("T")[0];
      
      // Count homework with due dates approaching
      const { count: homeworkCount } = await supabase
        .from("homework")
        .select("*", { count: "exact", head: true })
        .gte("due_date", today);
      
      setUnreadNotifications(homeworkCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/teacher/login");
  };

  if (authLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have permission to access the teacher portal.</p>
        <Button onClick={() => navigate("/")}>Go to Homepage</Button>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck },
    { id: "homework", label: "Homework", icon: BookOpen },
    { id: "exams", label: "Exams", icon: FileText },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "questions", label: "Questions", icon: GraduationCap },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-bold text-lg text-blue-700 dark:text-blue-400">Teacher Portal</h1>
                <p className="text-xs text-muted-foreground">
                  {teacherProfile ? teacherProfile.full_name : "SDSJSS Academic System"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="relative" onClick={() => setActiveTab("messages")}>
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Main Site</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-1 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-2 px-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <TeacherOverview teacherProfile={teacherProfile} onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="students">
            <TeacherStudents teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="attendance">
            <TeacherAttendance teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="homework">
            <TeacherHomework teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="exams">
            <TeacherExams teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="timetable">
            <TeacherTimetable teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="questions">
            <TeacherQuestionBank teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <TeacherAnalytics teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="messages">
            <TeacherMessages teacherId={teacherProfile?.id} />
          </TabsContent>

          <TabsContent value="settings">
            <TeacherSettings teacherProfile={teacherProfile} onProfileUpdate={fetchTeacherProfile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
