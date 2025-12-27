import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Reporting from "./pages/Reporting";
import MaintenanceCalendar from "./pages/MaintenanceCalendar";
import Kanban from "./pages/Kanban";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import RequestDetail from "./pages/RequestDetail";
import NewRequest from "./pages/NewRequest";
import AddWork from "./pages/AddWork";
import Teams from "./pages/Teams";
import NewTeam from "./pages/NewTeam";
import Equipment from "./pages/Equipment";
import NewEquipment from "./pages/NewEquipment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/equipment/new" element={<ProtectedRoute><NewEquipment /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><MaintenanceRequests /></ProtectedRoute>} />
            <Route path="/requests/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
            <Route path="/requests/new" element={<ProtectedRoute><NewRequest /></ProtectedRoute>} />
            <Route path="/calendar/add-work" element={<ProtectedRoute><AddWork /></ProtectedRoute>} />
            <Route path="/kanban" element={<ProtectedRoute><Kanban /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><MaintenanceCalendar /></ProtectedRoute>} />
            <Route path="/reporting" element={<ProtectedRoute><Reporting /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
            <Route path="/teams/new" element={<ProtectedRoute><NewTeam /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
