import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkle } from "@/components/Sparkle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Flame, Gift, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
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

export default function ChildHome() {
  const { childId } = useParams<{ childId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [curriculum, setCurriculum] = useState("cambridge");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (childId) {
      supabase.from("children").select("name, selected_curriculum").eq("id", childId).single().then(({ data, error }) => {
        if (error) toast.error("Child not found");
        else {
          setChildName(data?.name || "");
          setCurriculum((data as any)?.selected_curriculum || "cambridge");
        }
      });
      supabase.from("points").select("amount").eq("child_id", childId).then(({ data }) => {
        setTotalPoints((data || []).reduce((s, p) => s + p.amount, 0));
      });

      // Calculate streak from sessions
      supabase.from("sessions").select("started_at").eq("child_id", childId).order("started_at", { ascending: false }).then(({ data }) => {
        if (!data || data.length === 0) { setStreak(0); return; }
        const days = [...new Set(data.map(s => new Date(s.started_at).toDateString()))];
        let count = 0;
        const today = new Date();
        for (let i = 0; i < days.length; i++) {
          const expected = new Date(today);
          expected.setDate(today.getDate() - i);
          if (days[i] === expected.toDateString()) count++;
          else break;
        }
        setStreak(count);
      });
    }
  }, [childId]);

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
          <span className="font-display font-bold text-lg">{childName}'s Learning Hub</span>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {curriculumLabels[curriculum] || curriculum}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
              <Flame className="w-4 h-4 text-primary fill-primary" />
              <span className="font-display font-bold text-sm">{streak}</span>
            </div>
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
      </main>
    </div>
  );
}
