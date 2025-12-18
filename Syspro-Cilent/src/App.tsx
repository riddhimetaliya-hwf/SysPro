import { Toaster } from "@/components/UI/toaster";
import { Toaster as Sonner } from "@/components/UI/sonner";
import { TooltipProvider } from "@/components/UI/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import Configuration from "./pages/Configuration";
import SyncStatus from "./pages/SyncStatus";
import Reports from "./pages/Reports";
import Performance from "./pages/Performance";
import Analytics from "./pages/Analytics";
import ERPIntegration from "./pages/ERPIntegration";
import SimulationMode from "./pages/SimulationMode";
import Rules from "./pages/Rules";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useState } from "react";
import { SidebarProvider } from "@/components/UI/sidebar";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FilterProvider } from "@/contexts/FilterContext"; 
// import { HelpProvider } from "@/components/Help/HelpSystem";

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  // Create a new QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());
  // Set basename for production builds
  const basename = import.meta.env.PROD ? '/VisualScheduler' : '/';

  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <SidebarProvider>
              <AuthProvider>
                <FilterProvider> 
                <BrowserRouter basename={basename}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/performance" element={<Performance />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/rules" element={<Rules />} />
                      <Route path="/erp-integration" element={<ERPIntegration />} />
                      <Route path="/simulation" element={<SimulationMode />} />
                      <Route path="/configuration" element={<Configuration />} />
                      <Route path="/sync-status" element={<SyncStatus />} />
                      <Route path="/reports" element={<Reports />} />
                    </Route>
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                   </FilterProvider>
              </AuthProvider>
            </SidebarProvider>
          </TooltipProvider>
      </PerformanceProvider>
    </QueryClientProvider>
  );
}

export default App;
