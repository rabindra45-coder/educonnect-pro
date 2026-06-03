import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import SplashScreen from "@/components/SplashScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import OfflineBanner from "@/components/OfflineBanner";
import PageTransition from "@/components/layout/PageTransition";
import ThemeManagement from "./pages/admin/ThemeManagement";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Notices from "./pages/Notices";
import Admission from "./pages/Admission";
import Gallery from "./pages/Gallery";
import Academics from "./pages/Academics";
import ScienceFaculty from "./pages/academics/ScienceFaculty";
import ManagementFaculty from "./pages/academics/ManagementFaculty";
import LawFaculty from "./pages/academics/LawFaculty";
import ExamResults from "./pages/academics/ExamResults";
import AcademicCalendar from "./pages/academics/AcademicCalendar";
import NotFound from "./pages/NotFound";
import NoticeDetail from "./pages/NoticeDetail";
import ContactMessages from "./pages/admin/ContactMessages";
import AdminAuth from "./pages/AdminAuth";
import StudentAuth from "./pages/StudentAuth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import NoticesManagement from "./pages/admin/NoticesManagement";
import StudentsManagement from "./pages/admin/StudentsManagement";
import TeachersManagement from "./pages/admin/TeachersManagement";
import AdmissionsManagement from "./pages/admin/AdmissionsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import GalleryManagement from "./pages/admin/GalleryManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import DocumentsManagement from "./pages/admin/DocumentsManagement";
import Settings from "./pages/admin/Settings";
import ChatManagement from "./pages/admin/ChatManagement";
import ExamsManagement from "./pages/admin/ExamsManagement";
import SubjectsManagement from "./pages/admin/SubjectsManagement";
import MarksEntry from "./pages/admin/MarksEntry";
import AdminExamResults from "./pages/admin/ExamResults";
import FeeManagement from "./pages/admin/FeeManagement";
import StudentFees from "./pages/admin/StudentFees";
import AttendanceManagement from "./pages/admin/AttendanceManagement";
import AttendanceReports from "./pages/admin/AttendanceReports";
import StudentDashboard from "./pages/student/StudentDashboard";
import VerifyStudent from "./pages/VerifyStudent";
import Chat from "./pages/Chat";
import LibraryDashboard from "./pages/library/LibraryDashboard";
import LibraryLogin from "./pages/library/LibraryLogin";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AccountantLogin from "./pages/accountant/AccountantLogin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentLogin from "./pages/parent/ParentLogin";
import InstallApp from "./pages/InstallApp";
import InstallPortals from "./pages/InstallPortals";
import PortalInstall from "./pages/PortalInstall";
import FacilityDetail from "./pages/FacilityDetail";
import Facilities from "./pages/Facilities";
import AIControlCenter from "./pages/admin/AIControlCenter";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/notices" element={<PageTransition><Notices /></PageTransition>} />
        <Route path="/admission" element={<PageTransition><Admission /></PageTransition>} />
        <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
        <Route path="/academics" element={<PageTransition><Academics /></PageTransition>} />
        <Route path="/academics/science" element={<PageTransition><ScienceFaculty /></PageTransition>} />
        <Route path="/academics/management" element={<PageTransition><ManagementFaculty /></PageTransition>} />
        <Route path="/academics/law" element={<PageTransition><LawFaculty /></PageTransition>} />
        <Route path="/academics/results" element={<PageTransition><ExamResults /></PageTransition>} />
        <Route path="/academics/calendar" element={<PageTransition><AcademicCalendar /></PageTransition>} />
        <Route path="/login" element={<StudentAuth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/notices" element={<NoticesManagement />} />
        <Route path="/admin/students" element={<StudentsManagement />} />
        <Route path="/admin/teachers" element={<TeachersManagement />} />
        <Route path="/admin/admissions" element={<AdmissionsManagement />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/gallery" element={<GalleryManagement />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/admin/documents" element={<DocumentsManagement />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/chats" element={<ChatManagement />} />
        <Route path="/admin/exams" element={<ExamsManagement />} />
        <Route path="/admin/subjects" element={<SubjectsManagement />} />
        <Route path="/admin/exams/:examId/marks" element={<MarksEntry />} />
        <Route path="/admin/exams/:examId/results" element={<AdminExamResults />} />
        <Route path="/admin/fees" element={<FeeManagement />} />
        <Route path="/admin/student-fees" element={<StudentFees />} />
        <Route path="/admin/attendance" element={<AttendanceManagement />} />
        <Route path="/admin/attendance-reports" element={<AttendanceReports />} />
        <Route path="/admin/contact-messages" element={<ContactMessages />} />
        <Route path="/admin/ai-control" element={<AIControlCenter />} />
        <Route path="/admin/theme" element={<ThemeManagement />} />
        <Route path="/notices/:noticeId" element={<PageTransition><NoticeDetail /></PageTransition>} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/verify/:studentId" element={<VerifyStudent />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/library" element={<LibraryDashboard />} />
        <Route path="/library/login" element={<LibraryLogin />} />
        <Route path="/accountant" element={<AccountantDashboard />} />
        <Route path="/accountant/login" element={<AccountantLogin />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/login" element={<ParentLogin />} />
        <Route path="/install" element={<PageTransition><InstallPortals /></PageTransition>} />
        <Route path="/install/main" element={<PageTransition><InstallApp /></PageTransition>} />
        <Route path="/install/:portal" element={<PageTransition><PortalInstall /></PageTransition>} />
        <Route path="/facilities" element={<PageTransition><Facilities /></PageTransition>} />
        <Route path="/facilities/:facilityId" element={<PageTransition><FacilityDetail /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <SplashScreen />
              <BrowserRouter>
                <OfflineBanner />
                <AnimatedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
