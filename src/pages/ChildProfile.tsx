import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OwlMascot } from "@/components/OwlMascot";
import { User, Star, BookOpen, Flame } from "lucide-react";

const curriculumLabels: Record<string, string> = {
  cambridge: "Cambridge",
  caps: "CAPS (South Africa)",
  ieb: "IEB (South Africa)",
};

export default function ChildProfile() {
  const { childId } = useParams<{ childId: string }>();
  const [child, setChild] = useState<any>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!childId) return;

    supabase.from("children").select("*").eq("id", childId).single().then(({ data }) => setChild(data));

    supabase.from("points").select("amount").eq("child_id", childId).then(({ data }) => {
      setTotalXP(data?.reduce((sum, p) => sum + p.amount, 0) || 0);
    });

    supabase.from("sessions").select("id").eq("child_id", childId).then(({ data }) => {
      setSessionCount(data?.length || 0);
    });
  }, [childId]);

  if (!child) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <User className="w-5 h-5 text-primary" />
        <span className="font-display font-bold text-lg">My Profile</span>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-6 pt-6">
        <OwlMascot size="md" message={`Looking great, ${child.name}! Keep learning! 🌟`} className="mx-auto" />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> {child.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Grade</span>
              <Badge variant="secondary">{child.grade}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Curriculum</span>
              <Badge variant="outline">{curriculumLabels[child.selected_curriculum] || child.selected_curriculum}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Language</span>
              <Badge variant="outline" className="capitalize">{child.preferred_language || "English"}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-6">
              <Star className="h-8 w-8 text-[hsl(var(--star-gold))]" />
              <span className="font-display font-bold text-2xl">{totalXP}</span>
              <span className="text-xs text-muted-foreground">Total XP</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-1 py-6">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-display font-bold text-2xl">{sessionCount}</span>
              <span className="text-xs text-muted-foreground">Sessions</span>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
