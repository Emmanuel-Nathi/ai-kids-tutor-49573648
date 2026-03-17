import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionWithMessages } from "@/hooks/useSessionHistory";

interface CurriculumMasteryProps {
  sessions: SessionWithMessages[];
}

const MASTERY_SUBJECTS = ["math", "english", "science", "general"];
const MASTERY_COLORS = ["bg-muted", "bg-destructive/30", "bg-star-gold/40", "bg-accent/50"];
const MASTERY_LABELS = ["Not Started", "Getting There", "Good Progress", "Crushing It!"];

export function CurriculumMastery({ sessions }: CurriculumMasteryProps) {
  const subjectStats = useMemo(() => {
    return sessions.reduce((acc, s) => {
      const subj = s.subject || "general";
      if (!acc[subj]) acc[subj] = { focusMinutes: 0, sessions: 0 };
      acc[subj].focusMinutes += Math.round(s.active_time_seconds / 60);
      acc[subj].sessions += 1;
      return acc;
    }, {} as Record<string, { focusMinutes: number; sessions: number }>);
  }, [sessions]);

  const getMasteryLevel = (subj: string) => {
    const stats = subjectStats[subj];
    if (!stats) return 0;
    return Math.min(3, Math.floor(stats.focusMinutes / 15) + (stats.sessions >= 3 ? 1 : 0));
  };

  return (
    <Card>
      <CardHeader><CardTitle className="font-display text-base">Curriculum Mastery</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {MASTERY_SUBJECTS.map((subj) => {
            const level = getMasteryLevel(subj);
            return (
              <div key={subj} className="flex flex-col items-center gap-1">
                <div className={`w-full aspect-square rounded-xl ${MASTERY_COLORS[level]} flex items-center justify-center`}>
                  <span className="text-2xl">
                    {subj === "math" ? "🔢" : subj === "english" ? "📖" : subj === "science" ? "🔬" : "🌍"}
                  </span>
                </div>
                <span className="text-xs font-display font-medium capitalize">{subj}</span>
                <span className="text-[10px] text-muted-foreground">{MASTERY_LABELS[level]}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
