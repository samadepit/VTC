import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
import GuestRoute from "./components/GuestRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route element={<ProtectedRouteAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            {/* Bloquer l'accès à la page de connexion si déjà connecté */}
            <Route element={<GuestRoute />}>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
            </Route>
            {/* Protéger les routes pour les utilisateurs connectés */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="register" element={<Register />} />
              
            </Route>


          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;