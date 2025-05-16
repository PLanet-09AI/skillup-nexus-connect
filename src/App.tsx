
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
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleBasedRoute from "@/components/auth/RoleBasedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
                    <div>Workshops page placeholder</div>
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
                    <div>Workshop Manager page placeholder</div>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learner-profiles"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["recruiter"]}>
                    <div>Learner Profiles page placeholder</div>
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
