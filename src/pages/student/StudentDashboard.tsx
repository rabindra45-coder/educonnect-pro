import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Calendar, FileText, Eye, Loader2, ScanFace, CreditCard, FolderOpen, TrendingUp, Wallet, Book, UserCheck, BookOpen, MessageSquare } from "lucide-react";
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
import FaceRegistrationDialog from "@/components/student/FaceRegistrationDialog";
import StudentIDCard from "@/components/student/StudentIDCard";
import StudentDocumentsCard from "@/components/student/StudentDocumentsCard";
import StudentResultsCard from "@/components/student/StudentResultsCard";
import StudentFeesCard from "@/components/student/StudentFeesCard";
import StudentLibraryCard from "@/components/student/StudentLibraryCard";
import StudentAttendanceCard from "@/components/student/StudentAttendanceCard";
import StudentHomeworkCard from "@/components/student/StudentHomeworkCard";
import StudentMessagesCard from "@/components/student/StudentMessagesCard";

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
  ip_address?: string;
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

interface StudentDocument {
  id: string;
  document_type: string;
  title: string;
  serial_number: string | null;
  document_data: Record<string, unknown>;
  document_image_url: string | null;
  issued_date: string | null;
  issued_by: string | null;
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
  const [studentDocuments, setStudentDocuments] = useState<StudentDocument[]>([]);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [hasFaceData, setHasFaceData] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
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
      fetchFaceData(),
      fetchSchoolSettings(),
      fetchStudentDocuments(),
    ]);
    setIsLoading(false);
  };

  const fetchSchoolSettings = async () => {
    const { data } = await supabase
      .from("school_settings")
      .select("school_name, school_address, school_phone, school_email, school_website, logo_url, principal_name")
      .limit(1)
      .maybeSingle();
    setSchoolSettings(data);
  };

  const fetchFaceData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("student_face_data")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();
    setHasFaceData(!!data);
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

  const fetchHomeworkCount = async () => {
    try {
      if (!studentInfo?.class) return;
      const { count } = await supabase
        .from("homework")
        .select("*", { count: "exact", head: true })
        .eq("class", studentInfo.class)
        .eq("is_published", true);
      setHomeworkCount(count || 0);
    } catch (error) {
      console.error("Error fetching homework count:", error);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      if (!user) return;
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
      setUnreadMessages(count || 0);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  const fetchStudentDocuments = async () => {
    try {
      if (!studentInfo?.id) return;
      const { data } = await supabase
        .from("student_documents")
        .select("id, document_type, title, serial_number, document_data, document_image_url, issued_date, issued_by")
        .eq("student_id", studentInfo.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setStudentDocuments((data as StudentDocument[]) || []);
    } catch (error) {
      console.error("Error fetching student documents:", error);
    }
  };

  useEffect(() => {
    if (studentInfo?.class) {
      fetchExamResults();
      fetchHomeworkCount();
    }
  }, [studentInfo?.class]);

  useEffect(() => {
    if (studentInfo?.id) fetchStudentDocuments();
  }, [studentInfo?.id]);

  useEffect(() => {
    if (user) fetchUnreadMessages();
  }, [user]);

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

      <FaceRegistrationDialog
        open={showFaceRegistration}
        onOpenChange={setShowFaceRegistration}
        onSuccess={() => setHasFaceData(true)}
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
              homeworkCount={homeworkCount}
              unreadMessages={unreadMessages}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="flex flex-wrap gap-1 h-auto p-1 lg:inline-flex bg-card border">
                <TabsTrigger value="overview" className="gap-2"><User className="w-4 h-4 hidden sm:inline" />Overview</TabsTrigger>
                <TabsTrigger value="homework" className="gap-2"><BookOpen className="w-4 h-4 hidden sm:inline" />Homework</TabsTrigger>
                <TabsTrigger value="messages" className="gap-2"><MessageSquare className="w-4 h-4 hidden sm:inline" />Messages</TabsTrigger>
                <TabsTrigger value="idcard" className="gap-2"><CreditCard className="w-4 h-4 hidden sm:inline" />ID Card</TabsTrigger>
                <TabsTrigger value="attendance" className="gap-2"><UserCheck className="w-4 h-4 hidden sm:inline" />Attendance</TabsTrigger>
                <TabsTrigger value="fees" className="gap-2"><Wallet className="w-4 h-4 hidden sm:inline" />Fees</TabsTrigger>
                <TabsTrigger value="library" className="gap-2"><Book className="w-4 h-4 hidden sm:inline" />Library</TabsTrigger>
                <TabsTrigger value="documents" className="gap-2"><FolderOpen className="w-4 h-4 hidden sm:inline" />Documents</TabsTrigger>
                <TabsTrigger value="notices" className="gap-2"><Bell className="w-4 h-4 hidden sm:inline" />Notices</TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4 hidden sm:inline" />Calendar</TabsTrigger>
                <TabsTrigger value="results" className="gap-2"><FileText className="w-4 h-4 hidden sm:inline" />Results</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ProfileCard
                    studentInfo={studentInfo}
                    isUploadingPhoto={isUploadingPhoto}
                    hasFaceData={hasFaceData}
                    onPhotoUpload={handlePhotoUpload}
                    onEditProfile={openEditProfileDialog}
                    onSetupFaceLogin={() => setShowFaceRegistration(true)}
                  />
                  <div className="lg:col-span-2 space-y-6">
                    {/* Messages and Homework Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <StudentMessagesCard 
                        studentId={studentInfo.id} 
                        compact={true} 
                        limit={3}
                        onViewAll={() => setActiveTab("messages")}
                      />
                      <StudentHomeworkCard
                        studentId={studentInfo.id}
                        studentClass={studentInfo.class}
                        section={studentInfo.section}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NoticesCard notices={notices} limit={4} onViewAll={() => setActiveTab("notices")} />
                      <UpcomingEventsCard events={upcomingEvents} limit={4} onViewAll={() => setActiveTab("calendar")} />
                    </div>
                    <ActivityLogCard activities={activities} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="homework">
                <StudentHomeworkCard
                  studentId={studentInfo.id}
                  studentClass={studentInfo.class}
                  section={studentInfo.section}
                />
              </TabsContent>

              <TabsContent value="messages">
                <StudentMessagesCard studentId={studentInfo.id} />
              </TabsContent>

              <TabsContent value="idcard">
                <div className="max-w-md mx-auto">
                  {schoolSettings && (
                    <StudentIDCard
                      studentInfo={studentInfo}
                      schoolSettings={schoolSettings}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <StudentAttendanceCard studentId={studentInfo.id} />
              </TabsContent>

              <TabsContent value="fees">
                <StudentFeesCard
                  studentId={studentInfo.id}
                  studentName={studentInfo.full_name}
                  className={studentInfo.class}
                />
              </TabsContent>

              <TabsContent value="library">
                <StudentLibraryCard
                  studentId={studentInfo.id}
                  studentName={studentInfo.full_name}
                  registrationNumber={studentInfo.registration_number}
                  studentClass={studentInfo.class}
                />
              </TabsContent>

              <TabsContent value="documents">
                <StudentDocumentsCard documents={studentDocuments} />
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
            <StudentResultsCard
              studentId={studentInfo.id}
              studentName={studentInfo.full_name}
              className={studentInfo.class}
              registrationNumber={studentInfo.registration_number}
            />
          </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
