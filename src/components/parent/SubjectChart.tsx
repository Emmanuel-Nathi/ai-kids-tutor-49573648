import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { SessionWithMessages } from "@/hooks/useSessionHistory";

const SUBJECT_COLORS: Record<string, string> = {
  math: "hsl(24, 95%, 53%)",
  english: "hsl(217, 91%, 60%)",
  science: "hsl(142, 71%, 45%)",
  general: "hsl(45, 93%, 58%)",
};

interface SubjectChartProps {
  sessions: SessionWithMessages[];
}

export function SubjectChart({ sessions }: SubjectChartProps) {
  const chartData = useMemo(() => {
    const stats = sessions.reduce((acc, s) => {
      const subj = s.subject || "general";
      if (!acc[subj]) acc[subj] = { subject: subj, focusMinutes: 0 };
      acc[subj].focusMinutes += Math.round(s.active_time_seconds / 60);
      return acc;
    }, {} as Record<string, { subject: string; focusMinutes: number }>);
    return Object.values(stats);
  }, [sessions]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle className="font-display text-base">Focus Time by Subject</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="focusMinutes" name="Focus (min)" radius={[8, 8, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.subject} fill={SUBJECT_COLORS[entry.subject] || "hsl(var(--muted))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
