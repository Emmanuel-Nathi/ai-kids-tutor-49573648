import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SubjectStat {
  subject: string;
  avgScore: number;
  sessions: number;
}

const COLORS: Record<string, string> = {
  math: "hsl(24, 95%, 53%)",
  english: "hsl(217, 91%, 60%)",
  science: "hsl(142, 71%, 45%)",
  general: "hsl(45, 93%, 58%)",
};

export function ParentAnalytics({ childId }: { childId: string }) {
  const [stats, setStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    supabase
      .from("sessions")
      .select("subject, curriculum_alignment_score")
      .eq("child_id", childId)
      .then(({ data }) => {
        const grouped: Record<string, { total: number; count: number; sessions: number }> = {};
        for (const s of data || []) {
          const subj = s.subject || "general";
          if (!grouped[subj]) grouped[subj] = { total: 0, count: 0, sessions: 0 };
          grouped[subj].sessions += 1;
          if (s.curriculum_alignment_score != null) {
            grouped[subj].total += s.curriculum_alignment_score;
            grouped[subj].count += 1;
          }
        }
        const result: SubjectStat[] = Object.entries(grouped).map(([subject, g]) => ({
          subject,
          avgScore: g.count > 0 ? Math.round(g.total / g.count) : 0,
          sessions: g.sessions,
        }));
        setStats(result);
        setLoading(false);
      });
  }, [childId]);

  if (loading) return null;
  if (stats.length === 0) return null;

  const struggling = stats.filter((s) => s.avgScore > 0).sort((a, b) => a.avgScore - b.avgScore)[0];

  return (
    <div className="space-y-4">
      {struggling && struggling.avgScore < 70 && (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Struggling Subject: <span className="capitalize">{struggling.subject.replace(/_/g, " ")}</span></p>
              <p className="text-xs text-muted-foreground">
                Average alignment score: {struggling.avgScore}% across {struggling.sessions} sessions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Average Accuracy by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avgScore" name="Avg Score (%)" radius={[8, 8, 0, 0]}>
                {stats.map((entry) => (
                  <Cell key={entry.subject} fill={COLORS[entry.subject] || "hsl(var(--muted))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
