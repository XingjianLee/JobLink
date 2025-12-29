import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import JobseekerAuth from "./pages/auth/JobseekerAuth";
import CompanyAuth from "./pages/auth/CompanyAuth";
import ResetPassword from "./pages/auth/ResetPassword";
import SeedData from "./pages/SeedData";
import JobseekerDashboard from "./pages/jobseeker/Dashboard";
import JobseekerProfile from "./pages/jobseeker/Profile";
import JobseekerResume from "./pages/jobseeker/Resume";
import JobseekerApplications from "./pages/jobseeker/Applications";
import JobseekerInvitations from "./pages/jobseeker/Invitations";
import JobseekerBookmarks from "./pages/jobseeker/Bookmarks";
import JobseekerSearch from "./pages/jobseeker/Search";
import CareerGuide from "./pages/jobseeker/CareerGuide";
import JobFairs from "./pages/jobseeker/JobFairs";
import PartTimeJobs from "./pages/jobseeker/PartTimeJobs";
import AIAssistant from "./pages/jobseeker/AIAssistant";
import NotFound from "./pages/NotFound";
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyProfile from "./pages/company/Profile";
import CompanyJobs from "./pages/company/Jobs";
import CompanyJobForm from "./pages/company/JobForm";
import CompanyApplications from "./pages/company/Applications";
import CompanyTalentSearch from "./pages/company/TalentSearch";
import CompanyTalentBookmarks from "./pages/company/TalentBookmarks";
import CompanyInvitations from "./pages/company/Invitations";
import CompanyAccountSettings from "./pages/company/AccountSettings";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<Navigate to="/auth/jobseeker" replace />} />
            <Route path="/auth/jobseeker" element={<JobseekerAuth />} />
            <Route path="/auth/company" element={<CompanyAuth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            <Route path="/seed" element={<SeedData />} />
            
            {/* Jobseeker Routes */}
            <Route path="/jobseeker/dashboard" element={<JobseekerDashboard />} />
            <Route path="/jobseeker/ai-assistant" element={<AIAssistant />} />
            <Route path="/jobseeker/search" element={<JobseekerSearch />} />
            <Route path="/jobseeker/profile" element={<JobseekerProfile />} />
            <Route path="/jobseeker/resume" element={<JobseekerResume />} />
            <Route path="/jobseeker/applications" element={<JobseekerApplications />} />
            <Route path="/jobseeker/invitations" element={<JobseekerInvitations />} />
            <Route path="/jobseeker/bookmarks" element={<JobseekerBookmarks />} />
            <Route path="/jobseeker/career-guide" element={<CareerGuide />} />
            <Route path="/jobseeker/job-fairs" element={<JobFairs />} />
            <Route path="/jobseeker/part-time" element={<PartTimeJobs />} />
            
            {/* Company Routes */}
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/jobs" element={<CompanyJobs />} />
            <Route path="/company/jobs/new" element={<CompanyJobForm />} />
            <Route path="/company/jobs/:id/edit" element={<CompanyJobForm />} />
            <Route path="/company/applications" element={<CompanyApplications />} />
            <Route path="/company/talent-search" element={<CompanyTalentSearch />} />
            <Route path="/company/talent-bookmarks" element={<CompanyTalentBookmarks />} />
            <Route path="/company/invitations" element={<CompanyInvitations />} />
            <Route path="/company/account-settings" element={<CompanyAccountSettings />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
