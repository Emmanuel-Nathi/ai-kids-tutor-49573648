import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ParentAnalytics } from "@/components/ParentAnalytics";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { ChildStatsRow } from "@/components/parent/ChildStatsRow";
import { ActivityLog } from "@/components/parent/ActivityLog";
import { SessionHistory } from "@/components/parent/SessionHistory";
import { CurriculumMastery } from "@/components/parent/CurriculumMastery";
import { SubjectChart } from "@/components/parent/SubjectChart";
import { AnalyticsSkeleton } from "@/components/parent/AnalyticsSkeleton";

export default function ParentChildDetail() {
  const { childId } = useParams<{ childId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pinVerified, setPinVerified] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");

  const { childName, sessions, totalPoints, activityLog, todayLog, loading } = useSessionHistory(childId, pinVerified);

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
        <ChildStatsRow sessions={sessions} totalPoints={totalPoints} />

        <ActivityLog
          items={todayLog}
          title="Today's Activity"
          icon={<Zap className="w-4 h-4 text-primary" />}
          badgeCount={todayLog.length}
        />

        <ParentAnalytics sessions={sessions} />

        <SubjectChart sessions={sessions} />

        <CurriculumMastery sessions={sessions} />

        <ActivityLog
          items={activityLog}
          title="Full Activity Log"
          maxItems={50}
          showDate
        />

        <SessionHistory sessions={sessions} />
      </main>

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
