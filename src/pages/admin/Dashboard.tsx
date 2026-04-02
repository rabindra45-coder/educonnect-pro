import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  GraduationCap, 
  Megaphone, 
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  UserPlus,
  Loader2,
  ArrowUpRight,
  BarChart3,
  Wallet,
  CalendarDays,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalNotices: number;
  pendingAdmissions: number;
  approvedAdmissions: number;
  rejectedAdmissions: number;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

const Dashboard = () => {
  const { profile, hasAnyAdminRole, hasRole } = useAuth();
  const { toast } = useToast();
  const [isCreatingParents, setIsCreatingParents] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalNotices: 0,
    pendingAdmissions: 0,
    approvedAdmissions: 0,
    rejectedAdmissions: 0,
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasAnyAdminRole()) {
      fetchStats();
      fetchRecentAdmissions();
      if (hasRole("super_admin")) {
        fetchActivityLogs();
      }
    } else {
      setIsLoading(false);
    }
  }, [hasAnyAdminRole, hasRole]);

  const fetchStats = async () => {
    try {
      const [students, teachers, notices, admissions] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("notices").select("id", { count: "exact", head: true }),
        supabase.from("admissions").select("status"),
      ]);

      setStats({
        totalStudents: students.count || 0,
        totalTeachers: teachers.count || 0,
        totalNotices: notices.count || 0,
        pendingAdmissions: admissions.data?.filter(a => a.status === "pending").length || 0,
        approvedAdmissions: admissions.data?.filter(a => a.status === "approved").length || 0,
        rejectedAdmissions: admissions.data?.filter(a => a.status === "rejected").length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentAdmissions = async () => {
    try {
      const { data } = await supabase
        .from("admissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentAdmissions(data || []);
    } catch (error) {
      console.error("Error fetching recent admissions:", error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (logs) {
        const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const logsWithProfiles = logs.map(log => ({
          ...log,
          profiles: log.user_id ? profileMap.get(log.user_id) || null : null
        }));
        setActivityLogs(logsWithProfiles as ActivityLog[]);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  const handleBulkCreateParents = async () => {
    setIsCreatingParents(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-parents-bulk", { body: {} });
      if (error) throw error;
      toast({
        title: "Parent Accounts Created!",
        description: `Created: ${data.created}, Skipped: ${data.skipped}, Errors: ${data.errors}. Emails sent to new parents.`,
      });
    } catch (error: any) {
      console.error("Error creating parents:", error);
      toast({ title: "Error", description: error.message || "Failed to create parent accounts", variant: "destructive" });
    } finally {
      setIsCreatingParents(false);
    }
  };

  const totalAdmissions = stats.pendingAdmissions + stats.approvedAdmissions + stats.rejectedAdmissions;
  const approvalRate = totalAdmissions > 0 ? Math.round((stats.approvedAdmissions / totalAdmissions) * 100) : 0;

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      trend: "+12%",
      trendUp: true,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-600",
      link: "/admin/students",
    },
    {
      title: "Faculty Members",
      value: stats.totalTeachers,
      icon: Users,
      trend: "+3",
      trendUp: true,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600",
      link: "/admin/teachers",
    },
    {
      title: "Active Notices",
      value: stats.totalNotices,
      icon: Megaphone,
      trend: "Live",
      trendUp: true,
      gradient: "from-amber-500/20 to-amber-600/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-600",
      link: "/admin/notices",
    },
    {
      title: "Pending Admissions",
      value: stats.pendingAdmissions,
      icon: FileText,
      trend: "Action needed",
      trendUp: false,
      gradient: "from-purple-500/20 to-purple-600/5",
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-600",
      link: "/admin/admissions",
    },
  ];

  const quickActions = [
    { label: "Manage Students", icon: GraduationCap, path: "/admin/students" },
    { label: "Fee Collection", icon: Wallet, path: "/admin/fees" },
    { label: "Attendance", icon: CalendarDays, path: "/admin/attendance" },
    { label: "Exam Results", icon: BookOpen, path: "/admin/exams" },
    { label: "Reports", icon: BarChart3, path: "/admin/attendance-reports" },
    { label: "Admissions", icon: FileText, path: "/admin/admissions" },
  ];

  if (!hasAnyAdminRole()) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Pending</h2>
          <p className="text-muted-foreground max-w-md">
            Your account is registered but you don't have admin access yet. 
            Please contact a Super Admin to assign you a role.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Modern Header with Greeting */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary-dark p-6 sm:p-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary-foreground blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.p 
                className="text-primary-foreground/60 text-sm font-medium mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </motion.p>
              <motion.h1 
                className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Welcome back, {profile?.full_name?.split(" ")[0] || "Admin"} 👋
              </motion.h1>
              <motion.p 
                className="text-primary-foreground/70 mt-1 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Here's what's happening at Milestone International College today.
              </motion.p>
            </div>
            {hasRole("super_admin") && (
              <Button
                onClick={handleBulkCreateParents}
                disabled={isCreatingParents}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 shadow-lg"
              >
                {isCreatingParents ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isCreatingParents ? "Creating..." : "Create Parent Accounts"}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid - Modern Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Link to={stat.link}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br cursor-pointer overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
                  <CardContent className="p-4 sm:p-5 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {isLoading ? "..." : stat.value.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                      <span className={`text-[10px] sm:text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {stat.trend}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link to={action.path}>
                  <Card className="group hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Admission Pipeline & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-primary" />
                Admission Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Approval Rate</span>
                <span className="font-semibold">{approvalRate}%</span>
              </div>
              <Progress value={approvalRate} className="h-2" />
              
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{stats.pendingAdmissions}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Pending</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{stats.approvedAdmissions}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Approved</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{stats.rejectedAdmissions}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Today's Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Total Enrollment</span>
                <Badge variant="secondary" className="font-bold">{stats.totalStudents}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Faculty Strength</span>
                <Badge variant="secondary" className="font-bold">{stats.totalTeachers}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Active Notices</span>
                <Badge variant="secondary" className="font-bold">{stats.totalNotices}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Admission Queue</span>
                <Badge variant="outline" className="font-bold text-amber-600 border-amber-300">{stats.pendingAdmissions}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Admissions and Activity Logs */}
        <Tabs defaultValue="admissions" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="admissions">Recent Admissions</TabsTrigger>
            {hasRole("super_admin") && (
              <TabsTrigger value="activities">
                <Activity className="w-4 h-4 mr-2" />
                Activity Log
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="admissions">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recent Applications
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/admissions">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentAdmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No admission applications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAdmissions.map((admission, i) => (
                      <motion.div
                        key={admission.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {admission.student_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{admission.student_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {admission.application_number} • {admission.applying_for_class}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] sm:text-xs ${
                            admission.status === "pending"
                              ? "border-amber-300 text-amber-600 bg-amber-50"
                              : admission.status === "approved"
                              ? "border-emerald-300 text-emerald-600 bg-emerald-50"
                              : "border-red-300 text-red-600 bg-red-50"
                          }`}
                        >
                          {admission.status?.charAt(0).toUpperCase() + admission.status?.slice(1)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {hasRole("super_admin") && (
            <TabsContent value="activities">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-5 h-5 text-primary" />
                    System Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">No activity logs yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activityLogs.map((log, i) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">
                              <span className="font-medium">
                                {log.profiles?.full_name || log.profiles?.email || "System"}
                              </span>
                              {" "}
                              <span className="text-muted-foreground">—</span>
                              {" "}
                              <span className="font-medium capitalize text-primary">{log.action}</span>
                              {" on "}
                              <span className="font-medium">{log.entity_type}</span>
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
