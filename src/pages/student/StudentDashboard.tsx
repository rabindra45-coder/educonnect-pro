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
  EyeOff,
  Calendar,
  BookOpen,
  FileText,
  Phone,
  Mail,
  MapPin,
  Award,
  Users,
  Edit,
  Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  guardian_email: string | null;
  date_of_birth: string | null;
  address: string | null;
  photo_url: string | null;
  status: string | null;
  gender: string | null;
  admission_year: number | null;
}

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  details: any;
}

interface ExamResult {
  id: string;
  title: string;
  exam_type: string;
  class: string;
  academic_year: string;
  result_url: string | null;
  created_at: string;
}

interface AcademicEvent {
  id: string;
  title: string;
  event_date: string;
  end_date: string | null;
  event_type: string;
  description: string | null;
}

const DEFAULT_PASSWORD = "12345678";

const StudentDashboard = () => {
  const { user, profile, isLoading: authLoading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AcademicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
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
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && hasRole("student")) {
      fetchAllData();
      checkIfPasswordChangeRequired();
    } else if (user && !hasRole("student")) {
      navigate("/admin");
    }
  }, [user, hasRole]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStudentData(),
      fetchActivities(),
      fetchNotices(),
      fetchExamResults(),
      fetchUpcomingEvents(),
    ]);
    setIsLoading(false);
  };

  const checkIfPasswordChangeRequired = () => {
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
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      setNotices(data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const fetchExamResults = async () => {
    try {
      if (!studentInfo?.class) return;
      
      const { data } = await supabase
        .from("exam_results")
        .select("*")
        .eq("is_published", true)
        .eq("class", studentInfo.class)
        .order("created_at", { ascending: false })
        .limit(5);

      setExamResults(data || []);
    } catch (error) {
      console.error("Error fetching exam results:", error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("academic_calendar")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(5);

      setUpcomingEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Refetch exam results when studentInfo is loaded
  useEffect(() => {
    if (studentInfo?.class) {
      fetchExamResults();
    }
  }, [studentInfo?.class]);

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam": return "bg-red-500/10 text-red-600 border-red-200";
      case "holiday": return "bg-green-500/10 text-green-600 border-green-200";
      case "event": return "bg-blue-500/10 text-blue-600 border-blue-200";
      default: return "bg-gray-500/10 text-gray-600 border-gray-200";
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
                <span className="hidden sm:inline">Change Password</span>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Main Site</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary-foreground/20">
                <AvatarImage src={studentInfo?.photo_url || ""} />
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-lg">
                  {studentInfo?.full_name ? getInitials(studentInfo.full_name) : "ST"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold">
                  Welcome back, {studentInfo?.full_name?.split(" ")[0] || "Student"}!
                </h1>
                <p className="text-primary-foreground/80 mt-1">
                  {studentInfo?.registration_number && (
                    <span>Reg. No: {studentInfo.registration_number} • </span>
                  )}
                  Class: {studentInfo?.class || "N/A"} {studentInfo?.section && `(${studentInfo.section})`}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {studentInfo?.status === "active" ? "Active" : studentInfo?.status || "Active"}
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <GraduationCap className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">{studentInfo?.class || "-"}</p>
                  <p className="text-xs text-muted-foreground">Current Class</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="w-8 h-8 mx-auto text-secondary mb-2" />
                  <p className="text-2xl font-bold">{studentInfo?.roll_number || "-"}</p>
                  <p className="text-xs text-muted-foreground">Roll Number</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Calendar className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Events</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Bell className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{notices.length}</p>
                  <p className="text-xs text-muted-foreground">New Notices</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="gap-2">
                <User className="w-4 h-4 hidden sm:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="notices" className="gap-2">
                <Bell className="w-4 h-4 hidden sm:inline" />
                Notices
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="w-4 h-4 hidden sm:inline" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-2">
                <FileText className="w-4 h-4 hidden sm:inline" />
                Results
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Profile Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-1"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          My Profile
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {studentInfo ? (
                        <>
                          <div className="flex flex-col items-center mb-6">
                            <Avatar className="w-24 h-24 mb-4">
                              <AvatarImage src={studentInfo.photo_url || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                {getInitials(studentInfo.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold text-lg text-center">{studentInfo.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{studentInfo.registration_number}</p>
                          </div>

                          <Separator />

                          <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm">
                              <GraduationCap className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Class:</span>
                              <span className="font-medium ml-auto">
                                {studentInfo.class} {studentInfo.section && `- ${studentInfo.section}`}
                              </span>
                            </div>
                            
                            {studentInfo.roll_number && (
                              <div className="flex items-center gap-3 text-sm">
                                <Award className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Roll No:</span>
                                <span className="font-medium ml-auto">{studentInfo.roll_number}</span>
                              </div>
                            )}

                            {studentInfo.date_of_birth && (
                              <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">DOB:</span>
                                <span className="font-medium ml-auto">
                                  {formatDate(studentInfo.date_of_birth)} ({calculateAge(studentInfo.date_of_birth)} yrs)
                                </span>
                              </div>
                            )}

                            {studentInfo.gender && (
                              <div className="flex items-center gap-3 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Gender:</span>
                                <span className="font-medium ml-auto capitalize">{studentInfo.gender}</span>
                              </div>
                            )}

                            {studentInfo.admission_year && (
                              <div className="flex items-center gap-3 text-sm">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Admitted:</span>
                                <span className="font-medium ml-auto">{studentInfo.admission_year}</span>
                              </div>
                            )}
                          </div>

                          <Separator />

                          <div className="space-y-3 pt-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Guardian Details
                            </h4>
                            
                            {studentInfo.guardian_name && (
                              <div className="flex items-center gap-3 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium ml-auto">{studentInfo.guardian_name}</span>
                              </div>
                            )}

                            {studentInfo.guardian_phone && (
                              <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium ml-auto">{studentInfo.guardian_phone}</span>
                              </div>
                            )}

                            {studentInfo.guardian_email && (
                              <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium ml-auto text-xs">{studentInfo.guardian_email}</span>
                              </div>
                            )}

                            {studentInfo.address && (
                              <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <span className="text-muted-foreground">Address:</span>
                                <span className="font-medium ml-auto text-right">{studentInfo.address}</span>
                              </div>
                            )}
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

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Notices */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          Recent Notices
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("notices")}>
                          View All
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {notices.length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">No notices available.</p>
                        ) : (
                          <div className="space-y-3">
                            {notices.slice(0, 3).map((notice) => (
                              <div key={notice.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-foreground truncate">{notice.title}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                      {notice.content}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {notice.is_pinned && (
                                      <Badge variant="secondary" className="text-xs">Pinned</Badge>
                                    )}
                                    {notice.category && (
                                      <Badge variant="outline" className="text-xs">{notice.category}</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDate(notice.created_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Upcoming Events */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Upcoming Events
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("calendar")}>
                          View Calendar
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {upcomingEvents.length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">No upcoming events.</p>
                        ) : (
                          <div className="space-y-3">
                            {upcomingEvents.slice(0, 3).map((event) => (
                              <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                <div className="text-center min-w-[50px]">
                                  <p className="text-2xl font-bold text-primary">
                                    {new Date(event.event_date).getDate()}
                                  </p>
                                  <p className="text-xs text-muted-foreground uppercase">
                                    {new Date(event.event_date).toLocaleString("en", { month: "short" })}
                                  </p>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{event.title}</h4>
                                  {event.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                                  )}
                                </div>
                                <Badge className={getEventTypeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* Activity Log */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No recent activity.</p>
                    ) : (
                      <div className="space-y-2">
                        {activities.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium capitalize">{activity.action}</span>
                                <span className="text-muted-foreground"> on {activity.entity_type}</span>
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Notices Tab */}
            <TabsContent value="notices">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    All Notices
                  </CardTitle>
                  <CardDescription>Stay updated with school announcements</CardDescription>
                </CardHeader>
                <CardContent>
                  {notices.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground">No notices available.</p>
                  ) : (
                    <div className="space-y-4">
                      {notices.map((notice) => (
                        <div key={notice.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {notice.is_pinned && (
                                  <Badge variant="secondary">📌 Pinned</Badge>
                                )}
                                {notice.category && (
                                  <Badge variant="outline">{notice.category}</Badge>
                                )}
                              </div>
                              <h3 className="font-semibold text-lg">{notice.title}</h3>
                              <p className="text-muted-foreground mt-2">{notice.content}</p>
                              {notice.attachment_url && (
                                <Button variant="link" size="sm" className="mt-2 p-0" asChild>
                                  <a href={notice.attachment_url} target="_blank" rel="noopener noreferrer">
                                    📎 View Attachment
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4">
                            Published on {formatDate(notice.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Academic Calendar
                  </CardTitle>
                  <CardDescription>Upcoming events, exams, and holidays</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground">No upcoming events scheduled.</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-card">
                          <div className="text-center min-w-[60px] py-2 px-3 rounded-lg bg-primary/10">
                            <p className="text-2xl font-bold text-primary">
                              {new Date(event.event_date).getDate()}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase">
                              {new Date(event.event_date).toLocaleString("en", { month: "short" })}
                            </p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge className={getEventTypeColor(event.event_type)}>
                                {event.event_type}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}
                            {event.end_date && event.end_date !== event.event_date && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Until {formatDate(event.end_date)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Exam Results
                  </CardTitle>
                  <CardDescription>View your published exam results</CardDescription>
                </CardHeader>
                <CardContent>
                  {examResults.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No exam results published yet for your class.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {examResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div>
                            <h3 className="font-semibold">{result.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{result.exam_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {result.academic_year}
                              </span>
                            </div>
                          </div>
                          {result.result_url ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={result.result_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 mr-2" />
                                View Result
                              </a>
                            </Button>
                          ) : (
                            <Badge variant="secondary">Coming Soon</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
