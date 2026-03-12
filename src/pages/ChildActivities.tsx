import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { Badge } from "@/components/ui/badge";
import { Code, Brain, Pencil, Puzzle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Activity {
  icon: typeof Code;
  title: string;
  desc: string;
  emoji: string;
  chatContext: string;
}

const activitiesByCurriculum: Record<string, Activity[]> = {
  cambridge: [
    { icon: Code, title: "Coding Puzzles", desc: "Learn logic with fun challenges", emoji: "💻", chatContext: "Let's do a coding logic puzzle suitable for my grade level" },
    { icon: Brain, title: "Science Investigation", desc: "Explore a Cambridge science puzzle", emoji: "🔬", chatContext: "Give me a Cambridge-level science investigation to explore" },
    { icon: Pencil, title: "Global Perspectives", desc: "Think globally, act locally", emoji: "🌍", chatContext: "Let's explore a global perspectives topic for my grade" },
    { icon: Puzzle, title: "Quiz Challenge", desc: "Test your knowledge", emoji: "❓", chatContext: "Give me a Cambridge curriculum quiz for my grade level" },
  ],
  caps: [
    { icon: Brain, title: "SA History Quiz", desc: "Test your South African knowledge", emoji: "🇿🇦", chatContext: "Give me a South African history quiz based on CAPS curriculum" },
    { icon: Puzzle, title: "Life Orientation Challenge", desc: "Skills for everyday life", emoji: "🧭", chatContext: "Give me a CAPS Life Orientation challenge for my grade" },
    { icon: Code, title: "Heritage Day Project", desc: "Celebrate SA's diversity", emoji: "🏛️", chatContext: "Help me with a Heritage Day project about South African culture" },
    { icon: Pencil, title: "Natural Sciences Quiz", desc: "Explore the natural world", emoji: "🌿", chatContext: "Give me a CAPS Natural Sciences quiz for my grade" },
  ],
  ieb: [
    { icon: Brain, title: "Critical Thinking Puzzle", desc: "Sharpen your analytical mind", emoji: "🧩", chatContext: "Give me a critical thinking puzzle suitable for IEB students" },
    { icon: Pencil, title: "Analytical Writing", desc: "Write with precision", emoji: "✍️", chatContext: "Give me an IEB-level analytical writing exercise" },
    { icon: Code, title: "Research Project", desc: "Dive deep into a topic", emoji: "📚", chatContext: "Help me start a mini research project on a topic relevant to IEB curriculum" },
    { icon: Puzzle, title: "IEB Quiz Challenge", desc: "Test your IEB knowledge", emoji: "❓", chatContext: "Give me an IEB curriculum quiz for my grade level" },
  ],
};

const curriculumLabels: Record<string, string> = {
  cambridge: "Cambridge",
  caps: "CAPS",
  ieb: "IEB",
};

export default function ChildActivities() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState("cambridge");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    if (childId) {
      supabase.from("children").select("selected_curriculum, grade").eq("id", childId).single().then(({ data }) => {
        if (data) {
          setCurriculum((data as any).selected_curriculum || "cambridge");
          setGrade(data.grade);
        }
      });
    }
  }, [childId]);

  const activities = activitiesByCurriculum[curriculum] || activitiesByCurriculum.cambridge;

  const startActivity = async (activity: Activity) => {
    if (!childId) return;
    // Create a session for the activity
    const { data, error } = await supabase.from("sessions").insert({
      child_id: childId,
      subject: "general",
      status: "active",
    }).select("id").single();

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate(`/child/${childId}/chat?session=${data.id}&subject=general&context=${encodeURIComponent(activity.chatContext)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <span className="font-display font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> After-School Fun
        </span>
        <Badge variant="secondary" className="text-[10px] uppercase ml-auto">
          {curriculumLabels[curriculum] || curriculum}
        </Badge>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <OwlMascot size="md" message="Homework done? Let's do something fun! 🎉" className="mx-auto pt-4" />
        <div className="grid grid-cols-2 gap-3">
          {activities.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow active:scale-95"
                onClick={() => startActivity(a)}
              >
                <CardContent className="flex flex-col items-center gap-2 py-6">
                  <span className="text-3xl">{a.emoji}</span>
                  <span className="font-display font-semibold text-sm">{a.title}</span>
                  <span className="text-xs text-muted-foreground text-center">{a.desc}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Activities are tailored to your {curriculumLabels[curriculum] || curriculum} curriculum. Each activity earns XP!
        </p>
      </main>
    </div>
  );
}
