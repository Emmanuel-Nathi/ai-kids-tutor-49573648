import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ChildSessionProvider } from "@/hooks/useChildSession";
import { AppLayout } from "@/components/AppLayout";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { OwlMascot } from "@/components/OwlMascot";
import { motion } from "framer-motion";

const Landing = lazy(() => import("./pages/Landing"));
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
const ChildMissions = lazy(() => import("./pages/ChildMissions"));
const ChildSetupWizard = lazy(() => import("./components/ChildSetupWizard").then(m => ({ default: m.ChildSetupWizard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const loadingMessages = [
  "Getting your owl ready… 🦉",
  "Sharpening pencils… ✏️",
  "Opening textbooks… 📚",
  "Warming up the brain… 🧠",
  "Counting the stars… ⭐",
];

function LoadingFallback() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse scale-125" />
          <OwlMascot size="lg" animate variant="idle" />
        </div>
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="font-display text-lg text-muted-foreground"
        >
          {loadingMessages[msgIndex]}
        </motion.p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChildSessionProvider>
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
      </ChildSessionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
