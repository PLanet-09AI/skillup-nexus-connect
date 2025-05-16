
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import WorkshopManager from "@/pages/WorkshopManager";
import WorkshopForm from "@/pages/WorkshopForm";
import LessonManager from "@/pages/LessonManager";
import LessonForm from "@/pages/LessonForm";
import LessonView from "@/pages/LessonView";
import ReflectionReview from "@/pages/ReflectionReview";
import WorkshopBrowser from "@/pages/WorkshopBrowser";
import WorkshopView from "@/pages/WorkshopView";
import LearnerProfiles from "@/pages/LearnerProfiles";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Job Seeker specific routes */}
            <Route
              path="/workshops"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["job_seeker"]}>
                    <WorkshopBrowser />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshops/:workshopId"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["job_seeker"]}>
                    <WorkshopView />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshops/:workshopId/lessons/:lessonId"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["job_seeker"]}>
                    <LessonView />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <div>Profile page placeholder</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["job_seeker"]}>
                    <div>Leaderboard page placeholder</div>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            
            {/* Recruiter specific routes */}
            <Route
              path="/workshop-manager"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <WorkshopManager />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-workshop"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <WorkshopForm />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-workshop/:id"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <WorkshopForm />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshops/:workshopId/lessons"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <LessonManager />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshops/:workshopId/create-lesson"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <LessonForm />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshops/:workshopId/lessons/:lessonId/edit"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <LessonForm />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/workshops/:workshopId/lessons/:lessonId/reflections"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <ReflectionReview />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learner-profiles"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <LearnerProfiles />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/learn-more" element={<div>Learn More page placeholder</div>} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
