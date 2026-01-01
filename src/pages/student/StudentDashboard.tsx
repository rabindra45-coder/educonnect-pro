import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Bell,
  GraduationCap,
  Home,
  LogOut,
  Clock,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import schoolLogo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

const DEFAULT_PASSWORD = "12345678";

const StudentDashboard = () => {
  const { user, profile, isLoading: authLoading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && hasRole("student")) {
      fetchStudentData();
      fetchActivities();
      fetchNotices();
      checkIfPasswordChangeRequired();
    } else if (user && !hasRole("student")) {
      navigate("/admin");
    }
  }, [user, hasRole]);

  const checkIfPasswordChangeRequired = () => {
    // Check if this is likely a first login with default password
    const mustChangePassword = user?.user_metadata?.must_change_password;
    if (mustChangePassword) {
      setShowPasswordDialog(true);
    }
  };

  const fetchStudentData = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("guardian_email", profile?.email)
        .maybeSingle();

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

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword === DEFAULT_PASSWORD) {
      toast({
        title: "Error",
        description: "Please choose a different password than the default",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
        data: { must_change_password: false },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });

      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
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
      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        // Only allow closing if not a required change
        if (!user?.user_metadata?.must_change_password || !open) {
          setShowPasswordDialog(open);
        }
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
          if (user?.user_metadata?.must_change_password) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Change Your Password
            </DialogTitle>
            <DialogDescription>
              {user?.user_metadata?.must_change_password 
                ? "For security, you must change your default password before continuing."
                : "Update your password to keep your account secure."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              {!user?.user_metadata?.must_change_password && (
                <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                  Cancel
                </Button>
              )}
              <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPasswordDialog(true)}>
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
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
