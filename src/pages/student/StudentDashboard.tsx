import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Calendar, FileText, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Components
import StudentHeader from "@/components/student/StudentHeader";
import WelcomeBanner from "@/components/student/WelcomeBanner";
import QuickStats from "@/components/student/QuickStats";
import ProfileCard from "@/components/student/ProfileCard";
import NoticesCard from "@/components/student/NoticesCard";
import UpcomingEventsCard from "@/components/student/UpcomingEventsCard";
import ActivityLogCard from "@/components/student/ActivityLogCard";
import EditProfileDialog from "@/components/student/EditProfileDialog";
import PasswordChangeDialog from "@/components/student/PasswordChangeDialog";
import NoStudentRecordCard from "@/components/student/NoStudentRecordCard";

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
  const [editProfileData, setEditProfileData] = useState({
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    address: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
      // First try to find by user_id (preferred method)
      let { data } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();
      
      // Fallback: try to find by guardian_email matching user's email
      if (!data && user?.email) {
        const { data: fallbackData } = await supabase
          .from("students")
          .select("*")
          .eq("guardian_email", user.email)
          .maybeSingle();
        
        // If found by email, update the user_id for future lookups
        if (fallbackData) {
          await supabase
            .from("students")
            .update({ user_id: user.id })
            .eq("id", fallbackData.id);
          data = { ...fallbackData, user_id: user.id };
        }
      }
      
      setStudentInfo(data);
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
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("academic_calendar")
        .select("*")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(10);
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (studentInfo?.class) fetchExamResults();
  }, [studentInfo?.class]);

  const openEditProfileDialog = () => {
    if (studentInfo) {
      setEditProfileData({
        guardian_name: studentInfo.guardian_name || "",
        guardian_phone: studentInfo.guardian_phone || "",
        guardian_email: studentInfo.guardian_email || "",
        address: studentInfo.address || "",
      });
      setShowEditProfileDialog(true);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !studentInfo) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `student-${studentInfo.id}-${Date.now()}.${fileExt}`;
      const filePath = `students/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("content-images").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("content-images").getPublicUrl(filePath);

      const { error: updateError } = await supabase.from("students").update({ photo_url: publicUrl }).eq("id", studentInfo.id);
      if (updateError) throw updateError;

      setStudentInfo({ ...studentInfo, photo_url: publicUrl });
      toast({ title: "Success", description: "Profile photo updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload photo", variant: "destructive" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!studentInfo) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("students")
        .update(editProfileData)
        .eq("id", studentInfo.id);
      if (error) throw error;
      setStudentInfo({ ...studentInfo, ...editProfileData });
      toast({ title: "Success", description: "Profile updated successfully" });
      setShowEditProfileDialog(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword === DEFAULT_PASSWORD) {
      toast({ title: "Error", description: "Please choose a different password", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
        data: { must_change_password: false },
      });
      if (error) throw error;
      toast({ title: "Success", description: "Password changed successfully" });
      setShowPasswordDialog(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleContactAdmin = () => {
    navigate("/contact");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        mustChangePassword={!!user?.user_metadata?.must_change_password}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        showPasswords={showPasswords}
        setShowPasswords={setShowPasswords}
        isChangingPassword={isChangingPassword}
        onPasswordChange={handlePasswordChange}
      />

      <EditProfileDialog
        open={showEditProfileDialog}
        onOpenChange={setShowEditProfileDialog}
        photoUrl={studentInfo?.photo_url || null}
        fullName={studentInfo?.full_name || "Student"}
        editProfileData={editProfileData}
        setEditProfileData={setEditProfileData}
        isUploadingPhoto={isUploadingPhoto}
        isUpdatingProfile={isUpdatingProfile}
        onPhotoUpload={handlePhotoUpload}
        onProfileUpdate={handleProfileUpdate}
      />

      <StudentHeader
        studentName={studentInfo?.full_name || profile?.full_name || "Student"}
        photoUrl={studentInfo?.photo_url || null}
        onPasswordChange={() => setShowPasswordDialog(true)}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        {!studentInfo ? (
          <NoStudentRecordCard
            userEmail={user?.email}
            onContactAdmin={handleContactAdmin}
          />
        ) : (
          <>
            <WelcomeBanner
              studentName={studentInfo.full_name}
              registrationNumber={studentInfo.registration_number}
              className={studentInfo.class}
              section={studentInfo.section}
              status={studentInfo.status}
              photoUrl={studentInfo.photo_url}
            />

            <QuickStats
              currentClass={studentInfo.class}
              rollNumber={studentInfo.roll_number}
              upcomingEvents={upcomingEvents.length}
              notices={notices.length}
              examResults={examResults.length}
              recentActivities={activities.length}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-card border">
                <TabsTrigger value="overview" className="gap-2"><User className="w-4 h-4 hidden sm:inline" />Overview</TabsTrigger>
                <TabsTrigger value="notices" className="gap-2"><Bell className="w-4 h-4 hidden sm:inline" />Notices</TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4 hidden sm:inline" />Calendar</TabsTrigger>
                <TabsTrigger value="results" className="gap-2"><FileText className="w-4 h-4 hidden sm:inline" />Results</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ProfileCard
                    studentInfo={studentInfo}
                    isUploadingPhoto={isUploadingPhoto}
                    onPhotoUpload={handlePhotoUpload}
                    onEditProfile={openEditProfileDialog}
                  />
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NoticesCard notices={notices} limit={4} onViewAll={() => setActiveTab("notices")} />
                      <UpcomingEventsCard events={upcomingEvents} limit={4} onViewAll={() => setActiveTab("calendar")} />
                </div>
                <ActivityLogCard activities={activities} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notices">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />All Notices</CardTitle></CardHeader>
              <CardContent>
                {notices.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No notices available.</p>
                ) : (
                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <div key={notice.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          {notice.is_pinned && <Badge variant="secondary">📌 Pinned</Badge>}
                          {notice.category && <Badge variant="outline">{notice.category}</Badge>}
                        </div>
                        <h3 className="font-semibold text-lg">{notice.title}</h3>
                        <p className="text-muted-foreground mt-2">{notice.content}</p>
                        <p className="text-xs text-muted-foreground mt-4">Published on {formatDate(notice.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Academic Calendar</CardTitle></CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">No upcoming events.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex gap-4 p-4 rounded-lg border bg-card">
                        <div className="text-center min-w-[60px] py-2 px-3 rounded-lg bg-primary/10">
                          <p className="text-2xl font-bold text-primary">{new Date(event.event_date).getDate()}</p>
                          <p className="text-xs text-muted-foreground uppercase">{new Date(event.event_date).toLocaleString("en", { month: "short" })}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            <Badge variant="outline">{event.event_type}</Badge>
                          </div>
                          {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Exam Results</CardTitle><CardDescription>View and download your published exam results</CardDescription></CardHeader>
              <CardContent>
                {examResults.length === 0 ? (
                  <div className="text-center py-12"><FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No exam results published yet.</p></div>
                ) : (
                  <div className="space-y-4">
                    {examResults.map((result) => (
                      <div key={result.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{result.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline">{result.exam_type}</Badge>
                            <Badge variant="secondary">{result.class}</Badge>
                            <span className="text-sm text-muted-foreground">{result.academic_year}</span>
                          </div>
                        </div>
                        {result.result_url ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={result.result_url} target="_blank" rel="noopener noreferrer"><Eye className="w-4 h-4 mr-2" />View</a>
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
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
