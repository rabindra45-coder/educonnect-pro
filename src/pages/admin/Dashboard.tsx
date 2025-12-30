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
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalNotices: number;
  pendingAdmissions: number;
  approvedAdmissions: number;
  rejectedAdmissions: number;
}

const Dashboard = () => {
  const { profile, hasAnyAdminRole } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalNotices: 0,
    pendingAdmissions: 0,
    approvedAdmissions: 0,
    rejectedAdmissions: 0,
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasAnyAdminRole()) {
      fetchStats();
      fetchRecentAdmissions();
    } else {
      setIsLoading(false);
    }
  }, [hasAnyAdminRole]);

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

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Notices",
      value: stats.totalNotices,
      icon: Megaphone,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Pending Admissions",
      value: stats.pendingAdmissions,
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Admin"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your school today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {isLoading ? "..." : stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Admission Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingAdmissions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground">{stats.approvedAdmissions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-foreground">{stats.rejectedAdmissions}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Admissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Admission Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAdmissions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No admission applications yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentAdmissions.map((admission) => (
                  <div
                    key={admission.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{admission.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {admission.application_number} • Class {admission.applying_for_class}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admission.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : admission.status === "approved"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
