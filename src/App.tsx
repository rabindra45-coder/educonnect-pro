import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Notices from "./pages/Notices";
import Admission from "./pages/Admission";
import Gallery from "./pages/Gallery";
import Academics from "./pages/Academics";
import PrimaryLevel from "./pages/academics/PrimaryLevel";
import LowerSecondary from "./pages/academics/LowerSecondary";
import SecondaryLevel from "./pages/academics/SecondaryLevel";
import ExamResults from "./pages/academics/ExamResults";
import AcademicCalendar from "./pages/academics/AcademicCalendar";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/AdminAuth";
import StudentAuth from "./pages/StudentAuth";
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
import StudentDashboard from "./pages/student/StudentDashboard";
import VerifyStudent from "./pages/VerifyStudent";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/admission" element={<Admission />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/academics/primary" element={<PrimaryLevel />} />
              <Route path="/academics/lower-secondary" element={<LowerSecondary />} />
              <Route path="/academics/secondary" element={<SecondaryLevel />} />
              <Route path="/academics/results" element={<ExamResults />} />
              <Route path="/academics/calendar" element={<AcademicCalendar />} />
              <Route path="/login" element={<StudentAuth />} />
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
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/verify/:studentId" element={<VerifyStudent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
