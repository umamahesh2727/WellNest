import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import HabitPage from "./pages/HabitPage";
import FoodPage from "./pages/FoodPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import LogoutMessage from "./components/LogoutMessage";
import ProfilePage from "./components/ProfilePage"; // ✅ Import Profile Page

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoggingOut } = useAuth();

  if (isLoggingOut) {
    return <LogoutMessage />;
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/habit" element={<HabitPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />{" "}
          {/* ✅ Add this */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
console.log("PROD URL:", import.meta.env.VITE_API_URL_PROD);

export default App;
