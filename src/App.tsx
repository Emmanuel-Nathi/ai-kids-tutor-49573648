import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { OwlMascot } from "@/components/OwlMascot";
import Landing from "./pages/Landing";

const Auth = lazy(() => import("./pages/Auth"));
const Paywall = lazy(() => import("./pages/Paywall"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ParentChildDetail = lazy(() => import("./pages/ParentChildDetail"));
const ChildHome = lazy(() => import("./pages/ChildHome"));
const ChildChat = lazy(() => import("./pages/ChildChat"));
const ChildHomework = lazy(() => import("./pages/ChildHomework"));
const ChildRewards = lazy(() => import("./pages/ChildRewards"));
const ChildActivities = lazy(() => import("./pages/ChildActivities"));
const ChildLogin = lazy(() => import("./pages/ChildLogin"));
const ChildProfile = lazy(() => import("./pages/ChildProfile"));
const ChildSetupWizard = lazy(() => import("./components/ChildSetupWizard").then(m => ({ default: m.ChildSetupWizard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <OwlMascot size="lg" message="Loading..." />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/child-login" element={<ChildLogin />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/paywall" element={<Paywall />} />
              <Route path="/parent" element={<SubscriptionGuard><ParentDashboard /></SubscriptionGuard>} />
              <Route path="/parent/child/:childId" element={<SubscriptionGuard><ParentChildDetail /></SubscriptionGuard>} />
              <Route path="/parent/add-child" element={<SubscriptionGuard><ChildSetupWizard /></SubscriptionGuard>} />
              <Route path="/child/:childId" element={<AppLayout><ChildHome /></AppLayout>} />
              <Route path="/child/:childId/chat" element={<AppLayout><ChildChat /></AppLayout>} />
              <Route path="/child/:childId/homework" element={<AppLayout><ChildHomework /></AppLayout>} />
              <Route path="/child/:childId/rewards" element={<AppLayout><ChildRewards /></AppLayout>} />
              <Route path="/child/:childId/activities" element={<AppLayout><ChildActivities /></AppLayout>} />
              <Route path="/child/:childId/profile" element={<AppLayout><ChildProfile /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
