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

const App = () => (
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
);

export default App;
