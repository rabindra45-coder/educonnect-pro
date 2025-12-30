import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Calendar, 
  BookOpen, 
  Bell,
  GraduationCap,
  Home,
  LogOut,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import schoolLogo from "@/assets/logo.png";
import { Link } from "react-router-dom";

interface StudentInfo {
  id: string;
  full_name: string;
  registration_number: string;
  class: string;
  section: string | null;
  roll_number: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  photo_url: string | null;
  status: string | null;
}

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  details: any;
}

const StudentDashboard = () => {
  const { user, profile, isLoading: authLoading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && hasRole("student")) {
      fetchStudentData();
      fetchActivities();
      fetchNotices();
    } else if (user && !hasRole("student")) {
      // If user has admin roles, redirect to admin
      navigate("/admin");
    }
  }, [user, hasRole]);

  const fetchStudentData = async () => {
    try {
      // Find student by matching guardian email or look up by user email
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("guardian_email", profile?.email)
        .single();

      if (data) {
        setStudentInfo(data);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      setNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-display text-sm font-bold text-foreground">Student Portal</h1>
                <p className="text-xs text-muted-foreground">SDSJSS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Main Site
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome, {studentInfo?.full_name || profile?.full_name || "Student"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your student dashboard with all your information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    My Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {studentInfo ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                          {studentInfo.photo_url ? (
                            <img
                              src={studentInfo.photo_url}
                              alt={studentInfo.full_name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <GraduationCap className="w-12 h-12 text-primary" />
                          )}
                        </div>
                      </div>
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-lg">{studentInfo.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{studentInfo.registration_number}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Class</span>
                          <span className="font-medium">{studentInfo.class} {studentInfo.section && `- ${studentInfo.section}`}</span>
                        </div>
                        {studentInfo.roll_number && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Roll No</span>
                            <span className="font-medium">{studentInfo.roll_number}</span>
                          </div>
                        )}
                        {studentInfo.guardian_name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Guardian</span>
                            <span className="font-medium">{studentInfo.guardian_name}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            studentInfo.status === 'active' 
                              ? 'bg-green-500/10 text-green-600' 
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {studentInfo.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Student profile not found.</p>
                      <p className="text-sm">Contact admin if this is an error.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Notices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {notices.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No notices available.</p>
                  ) : (
                    <div className="space-y-3">
                      {notices.map((notice) => (
                        <div key={notice.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-foreground">{notice.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {notice.content}
                              </p>
                            </div>
                            {notice.is_pinned && (
                              <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                Pinned
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activity Log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  My Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No recent activity.</p>
                ) : (
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            <span className="font-medium capitalize">{activity.action}</span>
                            {" "}on{" "}
                            <span className="text-muted-foreground">{activity.entity_type}</span>
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
