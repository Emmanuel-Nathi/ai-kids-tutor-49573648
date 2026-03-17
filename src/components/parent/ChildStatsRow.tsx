import { Card, CardContent } from "@/components/ui/card";
import { Clock, MessageSquare, Star } from "lucide-react";
import { SessionWithMessages } from "@/hooks/useSessionHistory";

interface ChildStatsRowProps {
  sessions: SessionWithMessages[];
  totalPoints: number;
}

export function ChildStatsRow({ sessions, totalPoints }: ChildStatsRowProps) {
  const totalFocusMinutes = Math.round(sessions.reduce((s, sess) => s + sess.active_time_seconds, 0) / 60);
  const totalQuestions = sessions.reduce((s, sess) => s + sess.messages.filter((m) => m.role === "user").length, 0);

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="flex flex-col items-center py-4 gap-1">
          <Clock className="w-5 h-5 text-secondary" />
          <span className="font-display text-xl font-bold">{totalFocusMinutes > 0 ? `${totalFocusMinutes}m` : "0m"}</span>
          <span className="text-xs text-muted-foreground">Focus Time</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center py-4 gap-1">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-display text-xl font-bold">{totalQuestions}</span>
          <span className="text-xs text-muted-foreground">Questions</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center py-4 gap-1">
          <Star className="w-5 h-5 text-star-gold fill-star-gold" />
          <span className="font-display text-xl font-bold">{totalPoints}</span>
          <span className="text-xs text-muted-foreground">Points</span>
        </CardContent>
      </Card>
    </div>
  );
}
