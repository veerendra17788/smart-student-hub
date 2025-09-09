import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentProfile from "@/pages/student/StudentProfile";
import StudentActivities from "@/pages/student/StudentActivities";
import StudentPortfolio from "@/pages/student/StudentPortfolio";
import StudentEvents from "@/pages/student/StudentEvents";
import AIRecommendations from "@/pages/student/AIRecommendations";
import StudentAttendance from "@/pages/student/StudentAttendance";
import StudentAcademics from "@/pages/student/StudentAcademics";
import StudentAcademicCalendar from "@/pages/student/StudentAcademicCalendar";
import FacultyDashboard from "@/pages/faculty/FacultyDashboard";
import FacultyApprovals from "@/pages/faculty/FacultyApprovals";
import FacultyEvents from "@/pages/faculty/FacultyEvents";
import FacultyAnalytics from "@/pages/faculty/FacultyAnalytics";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/activities" element={<StudentActivities />} />
            <Route path="/student/portfolio" element={<StudentPortfolio />} />
            <Route path="/student/events" element={<StudentEvents />} />
            <Route path="/student/recommendations" element={<AIRecommendations />} />
            <Route path="/student/attendance" element={<StudentAttendance />} />
            <Route path="/student/academics" element={<StudentAcademics />} />
            <Route path="/student/academic-calendar" element={<StudentAcademicCalendar />} />
            
            {/* Faculty Routes */}
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/approvals" element={<FacultyApprovals />} />
            <Route path="/faculty/events" element={<FacultyEvents />} />
            <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;