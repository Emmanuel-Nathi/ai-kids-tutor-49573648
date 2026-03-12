import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Clock, MessageSquare, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Check if parent has PIN set
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("parent_pin").eq("user_id", user.id).single().then(({ data }) => {
      if (data?.parent_pin) {
        setHasPin(true);
      } else {
        setHasPin(false);
        setPinVerified(true); // No PIN set, skip verification
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
  }, [pinVerified, childId]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch child name
    const { data: child } = await supabase.from("children").select("name").eq("id", childId!).single();
    setChildName(child?.name || "");

    // Fetch sessions with messages
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")
      .eq("child_id", childId!)
      .order("started_at", { ascending: false });

    const enriched: SessionWithMessages[] = [];
    for (const s of sessionsData || []) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("session_id", s.id)
        .order("created_at");
      enriched.push({ ...s, messages: msgs || [] });
    }
    setSessions(enriched);

    // Fetch total points
    const { data: pts } = await supabase.from("points").select("amount").eq("child_id", childId!);
    setTotalPoints((pts || []).reduce((sum, p) => sum + p.amount, 0));

    setLoading(false);
  };

  // Build chart data: per-subject stats
  const subjectStats = sessions.reduce((acc, s) => {
    const subj = s.subject || "general";
    if (!acc[subj]) acc[subj] = { subject: subj, focusMinutes: 0, helpRequests: 0, sessions: 0 };
    acc[subj].focusMinutes += Math.round(s.active_time_seconds / 60);
    acc[subj].helpRequests += s.messages.filter((m) => m.role === "user").length;
    acc[subj].sessions += 1;
    return acc;
  }, {} as Record<string, { subject: string; focusMinutes: number; helpRequests: number; sessions: number }>);

  const chartData = Object.values(subjectStats);

  // Mastery heatmap
  const masterySubjects = ["math", "english", "science", "general"];
  const getMasteryLevel = (subj: string) => {
    const stats = subjectStats[subj];
    if (!stats) return 0;
    return Math.min(3, Math.floor(stats.focusMinutes / 15) + (stats.sessions >= 3 ? 1 : 0));
  };
  const masteryColors = ["bg-muted", "bg-destructive/30", "bg-star-gold/40", "bg-accent/50"];
  const masteryLabels = ["Not Started", "Getting There", "Good Progress", "Crushing It!"];

  if (hasPin === null) return null;

  // PIN verification dialog
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
                    <span className="text-lg">{s.subject === "math" ? "🔢" : s.subject === "english" ? "📖" : s.subject === "science" ? "🔬" : "🌍"}</span>
                    <div>
                      <p className="text-sm font-medium capitalize">{s.subject || "General"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display">{s.messages.length} msgs</p>
                    <p className="text-xs text-muted-foreground">{Math.round(s.active_time_seconds / 60)}m focus</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      {/* Transcript dialog */}
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
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
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

      {/* Set PIN dialog */}
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
