import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ParentDashboard from "./pages/ParentDashboard";
import ParentChildDetail from "./pages/ParentChildDetail";
import ChildHome from "./pages/ChildHome";
import ChildChat from "./pages/ChildChat";
import ChildHomework from "./pages/ChildHomework";
import ChildRewards from "./pages/ChildRewards";
import ChildActivities from "./pages/ChildActivities";
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
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/child/:childId" element={<ParentChildDetail />} />
            <Route path="/child/:childId" element={<ChildHome />} />
            <Route path="/child/:childId/chat" element={<ChildChat />} />
            <Route path="/child/:childId/homework" element={<ChildHomework />} />
            <Route path="/child/:childId/rewards" element={<ChildRewards />} />
            <Route path="/child/:childId/activities" element={<ChildActivities />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
