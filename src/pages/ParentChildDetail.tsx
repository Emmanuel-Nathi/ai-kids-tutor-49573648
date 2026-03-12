import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Clock, MessageSquare, Star, TrendingUp, Camera, Gift, Zap } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ParentAnalytics } from "@/components/ParentAnalytics";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { format, isToday } from "date-fns";

interface SessionWithMessages {
  id: string;
  subject: string | null;
  started_at: string;
  ended_at: string | null;
  active_time_seconds: number;
  idle_time_seconds: number;
  status: string;
  interaction_summary: string | null;
  curriculum_alignment_score: number | null;
  messages: { role: string; content: string; created_at: string }[];
}

interface ActivityLogItem {
  type: "points" | "session" | "homework" | "reward_claim";
  timestamp: string;
  title: string;
  detail: string;
  emoji: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  math: "hsl(24, 95%, 53%)",
  english: "hsl(217, 91%, 60%)",
  science: "hsl(142, 71%, 45%)",
  general: "hsl(45, 93%, 58%)",
};

export default function ParentChildDetail() {
  const { childId } = useParams<{ childId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pinVerified, setPinVerified] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  const [childName, setChildName] = useState("");
  const [sessions, setSessions] = useState<SessionWithMessages[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionWithMessages | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("parent_pin").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.parent_pin) {
        setHasPin(true);
      } else {
        setHasPin(false);
        setPinVerified(true);
      }
    });
  }, [user]);

  const verifyPin = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("parent_pin").eq("user_id", user.id).single();
    if (data?.parent_pin === pinInput) {
      setPinVerified(true);
    } else {
      toast.error("Incorrect PIN");
      setPinInput("");
    }
  };

  const saveNewPin = async () => {
    if (!user || newPin.length !== 4) return;
    const { error } = await supabase.from("profiles").update({ parent_pin: newPin }).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("PIN set successfully");
      setHasPin(true);
      setPinVerified(true);
      setSettingPin(false);
    }
  };

  useEffect(() => {
    if (!pinVerified || !childId) return;
    fetchData();

    // Realtime subscription on points
    const channel = supabase
      .channel(`points-${childId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "points", filter: `child_id=eq.${childId}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pinVerified, childId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: child } = await supabase.from("children").select("name").eq("id", childId!).single();
    setChildName(child?.name || "");

    const { data: sessionsData } = await supabase.from("sessions").select("*").eq("child_id", childId!).order("started_at", { ascending: false });

    const enriched: SessionWithMessages[] = [];
    for (const s of sessionsData || []) {
      const { data: msgs } = await supabase.from("messages").select("role, content, created_at").eq("session_id", s.id).order("created_at");
      enriched.push({ ...s, messages: msgs || [] });
    }
    setSessions(enriched);

    const { data: pts } = await supabase.from("points").select("amount, reason, created_at").eq("child_id", childId!).order("created_at", { ascending: false });
    setTotalPoints((pts || []).reduce((sum, p) => sum + p.amount, 0));

    // Build daily activity log
    const log: ActivityLogItem[] = [];

    // Points
    for (const p of pts || []) {
      log.push({
        type: "points",
        timestamp: p.created_at,
        title: `+${p.amount} XP`,
        detail: p.reason,
        emoji: "⭐",
      });
    }

    // Sessions
    for (const s of sessionsData || []) {
      log.push({
        type: "session",
        timestamp: s.started_at,
        title: `${(s.subject || "General").replace(/_/g, " ")} session`,
        detail: s.status === "completed" ? "Completed" : "Active",
        emoji: s.subject === "math" ? "🔢" : s.subject === "english" ? "📖" : s.subject === "science" ? "🔬" : "🌍",
      });
    }

    // Homework
    const { data: hw } = await supabase.from("homework").select("created_at, status, subject").eq("child_id", childId!).order("created_at", { ascending: false });
    for (const h of hw || []) {
      log.push({
        type: "homework",
        timestamp: h.created_at,
        title: `Homework ${h.status}`,
        detail: h.subject || "Worksheet",
        emoji: "📸",
      });
    }

    // Reward claims
    const { data: rc } = await supabase.from("reward_claims").select("created_at, status, reward_id").eq("child_id", childId!).order("created_at", { ascending: false });
    for (const r of rc || []) {
      log.push({
        type: "reward_claim",
        timestamp: r.created_at,
        title: `Reward ${r.status}`,
        detail: "",
        emoji: "🎁",
      });
    }

    // Sort by timestamp desc
    log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivityLog(log);

    setLoading(false);
  };

  const subjectStats = sessions.reduce((acc, s) => {
    const subj = s.subject || "general";
    if (!acc[subj]) acc[subj] = { subject: subj, focusMinutes: 0, helpRequests: 0, sessions: 0 };
    acc[subj].focusMinutes += Math.round(s.active_time_seconds / 60);
    acc[subj].helpRequests += s.messages.filter((m) => m.role === "user").length;
    acc[subj].sessions += 1;
    return acc;
  }, {} as Record<string, { subject: string; focusMinutes: number; helpRequests: number; sessions: number }>);

  const chartData = Object.values(subjectStats);

  const masterySubjects = ["math", "english", "science", "general"];
  const getMasteryLevel = (subj: string) => {
    const stats = subjectStats[subj];
    if (!stats) return 0;
    return Math.min(3, Math.floor(stats.focusMinutes / 15) + (stats.sessions >= 3 ? 1 : 0));
  };
  const masteryColors = ["bg-muted", "bg-destructive/30", "bg-star-gold/40", "bg-accent/50"];
  const masteryLabels = ["Not Started", "Getting There", "Good Progress", "Crushing It!"];

  const todayLog = activityLog.filter((item) => isToday(new Date(item.timestamp)));

  if (hasPin === null) return null;

  if (hasPin && !pinVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <OwlMascot size="md" className="mx-auto mb-2" />
            <CardTitle className="font-display">Enter Parent PIN</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <InputOTP value={pinInput} onChange={setPinInput} maxLength={4} onComplete={verifyPin}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={verifyPin} disabled={pinInput.length !== 4} className="w-full">Unlock</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <OwlMascot size="lg" message="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/parent")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">{childName}'s Report</span>
        {!hasPin && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setSettingPin(true)}>
            Set PIN
          </Button>
        )}
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center py-4 gap-1">
              <Clock className="w-5 h-5 text-secondary" />
              <span className="font-display text-xl font-bold">
                {sessions.reduce((s, sess) => s + sess.active_time_seconds, 0) > 0
                  ? `${Math.round(sessions.reduce((s, sess) => s + sess.active_time_seconds, 0) / 60)}m`
                  : "0m"}
              </span>
              <span className="text-xs text-muted-foreground">Focus Time</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center py-4 gap-1">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="font-display text-xl font-bold">
                {sessions.reduce((s, sess) => s + sess.messages.filter((m) => m.role === "user").length, 0)}
              </span>
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

        {/* Daily Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Today's Activity
              {todayLog.length > 0 && (
                <Badge variant="secondary" className="ml-auto">{todayLog.length} events</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity today yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {todayLog.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(item.timestamp), "HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics */}
        <ParentAnalytics childId={childId!} />

        {/* Subject chart */}
        {chartData.length > 0 && (
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
        )}

        {/* Curriculum mastery heatmap */}
        <Card>
          <CardHeader><CardTitle className="font-display text-base">Curriculum Mastery</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {masterySubjects.map((subj) => {
                const level = getMasteryLevel(subj);
                return (
                  <div key={subj} className="flex flex-col items-center gap-1">
                    <div className={`w-full aspect-square rounded-xl ${masteryColors[level]} flex items-center justify-center`}>
                      <span className="text-2xl">
                        {subj === "math" ? "🔢" : subj === "english" ? "📖" : subj === "science" ? "🔬" : "🌍"}
                      </span>
                    </div>
                    <span className="text-xs font-display font-medium capitalize">{subj}</span>
                    <span className="text-[10px] text-muted-foreground">{masteryLabels[level]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* All Activity Log */}
        <Card>
          <CardHeader><CardTitle className="font-display text-base">Full Activity Log</CardTitle></CardHeader>
          <CardContent>
            {activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLog.slice(0, 50).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(item.timestamp), "MMM d, HH:mm")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session transcripts */}
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
                    <span className="text-lg">{s.subject === "math" ? "🔢" : s.subject === "english" ? "📖" : s.subject === "science" ? "🔬" : s.subject === "life_orientation" ? "🧭" : s.subject === "natural_sciences" ? "🌿" : "🌍"}</span>
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
      </main>

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

      <Dialog open={settingPin} onOpenChange={setSettingPin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Set Parent PIN</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">Set a 4-digit PIN to protect the parent dashboard</p>
            <InputOTP value={newPin} onChange={setNewPin} maxLength={4}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={saveNewPin} disabled={newPin.length !== 4} className="w-full">Save PIN</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
