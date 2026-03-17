import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SessionWithMessages } from "@/hooks/useSessionHistory";

interface SessionHistoryProps {
  sessions: SessionWithMessages[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const [selectedSession, setSelectedSession] = useState<SessionWithMessages | null>(null);

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="font-display text-base">Session History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No sessions yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedSession(s)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {s.subject === "math" ? "🔢" : s.subject === "english" ? "📖" : s.subject === "science" ? "🔬" : s.subject === "life_orientation" ? "🧭" : s.subject === "natural_sciences" ? "🌿" : "🌍"}
                  </span>
                  <div>
                    <p className="text-sm font-medium capitalize">{(s.subject || "General").replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</p>
                    {s.interaction_summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{s.interaction_summary}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display">{s.messages.length} msgs</p>
                  <p className="text-xs text-muted-foreground">{Math.round(s.active_time_seconds / 60)}m focus</p>
                  {s.curriculum_alignment_score != null && (
                    <p className="text-[10px] text-primary font-medium">{s.curriculum_alignment_score}% aligned</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display capitalize">
              {selectedSession?.subject || "General"} — {selectedSession && new Date(selectedSession.started_at).toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="space-y-3 p-1">
              {selectedSession?.messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  <div className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {selectedSession?.messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No messages in this session</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
