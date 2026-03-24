import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChildData } from "@/hooks/useChildData";
import { useRequireChildSession } from "@/hooks/useChildSession";
import { supabase } from "@/integrations/supabase/client";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkle } from "@/components/Sparkle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Flame, Gift, Home, Sparkles, Star } from "lucide-react";
import { AIHomeworkHelper } from "@/components/AIHomeworkHelper";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const baseSubjects = [
  { id: "math", label: "Maths", emoji: "🔢", color: "bg-secondary/10 text-secondary" },
  { id: "english", label: "English", emoji: "📖", color: "bg-primary/10 text-primary" },
  { id: "science", label: "Science", emoji: "🔬", color: "bg-accent/10 text-accent" },
  { id: "general", label: "General", emoji: "🌍", color: "bg-star-gold/20 text-foreground" },
];

const capsExtraSubjects = [
  { id: "life_orientation", label: "Life Orientation", emoji: "🧭", color: "bg-primary/10 text-primary" },
  { id: "natural_sciences", label: "Natural Sciences", emoji: "🌿", color: "bg-accent/10 text-accent" },
];

const curriculumLabels: Record<string, string> = {
  cambridge: "Cambridge",
  caps: "CAPS",
  ieb: "IEB",
  general: "General",
};

const STREAK_MESSAGES: Record<number, string> = {
  3: "🔥 3-day streak! +10 XP bonus!",
  7: "🔥 7-day streak! +25 XP bonus!",
  14: "🔥 14-day streak! +50 XP bonus!",
  30: "🔥 30-day streak! +100 XP bonus!",
};

export default function ChildHome() {
  const { childId } = useParams<{ childId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { child, totalPoints, streak } = useChildData(childId);
  const [streakBannerShown, setStreakBannerShown] = useState(false);

  const childName = child?.name || "";
  const curriculum = child?.selected_curriculum || "cambridge";

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Show streak milestone toast once
  useEffect(() => {
    if (streakBannerShown || streak === 0) return;
    const milestones = [30, 14, 7, 3];
    for (const m of milestones) {
      if (streak >= m && STREAK_MESSAGES[m]) {
        toast.success(STREAK_MESSAGES[m], { duration: 5000 });
        setStreakBannerShown(true);
        break;
      }
    }
  }, [streak, streakBannerShown]);

  const subjects = curriculum === "caps" || curriculum === "ieb"
    ? [...baseSubjects, ...capsExtraSubjects]
    : baseSubjects;

  const startSession = async (subject: string) => {
    if (!childId) return;
    const { data, error } = await supabase.from("sessions").insert({
      child_id: childId,
      subject,
      status: "active",
    }).select("id").single();

    if (error) {
      toast.error(error.message);
      return;
    }
    navigate(`/child/${childId}/chat?session=${data.id}&subject=${subject}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="shrink-0">
            <Home className="w-5 h-5" />
          </Button>
          <span className="font-display font-bold text-lg">{childName}'s Learning Hub</span>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {curriculumLabels[curriculum] || curriculum}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1"
            >
              <Flame className="w-4 h-4 text-primary fill-primary" />
              <span className="font-display font-bold text-sm">{streak}</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 bg-star-gold/20 rounded-full px-3 py-1">
            <Star className="w-4 h-4 text-star-gold fill-star-gold" />
            <span className="font-display font-bold text-sm">{totalPoints}</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center pt-4"
        >
          <OwlMascot size="lg" variant="idle" message={`Hi ${childName}! What shall we learn today? 🎉`} />
        </motion.div>

        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-center">Pick a Subject</h3>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all active:scale-95 border-2 hover:border-primary/30"
                  onClick={() => startSession(s.id)}
                >
                  <CardContent className="flex flex-col items-center gap-2 py-6">
                    <span className="text-3xl">{s.emoji}</span>
                    <span className="font-display font-semibold text-sm">{s.label}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="flex flex-col h-auto py-4 gap-1" onClick={() => navigate(`/child/${childId}/homework`)}>
            <Camera className="w-6 h-6 text-secondary" />
            <span className="text-xs font-display">Homework</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-4 gap-1" onClick={() => navigate(`/child/${childId}/rewards`)}>
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-xs font-display">Rewards</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-4 gap-1" onClick={() => navigate(`/child/${childId}/activities`)}>
            <Sparkles className="w-6 h-6 text-accent" />
            <span className="text-xs font-display">Activities</span>
          </Button>
        </div>

        <AIHomeworkHelper childId={childId!} />
      </main>
    </div>
  );
}
