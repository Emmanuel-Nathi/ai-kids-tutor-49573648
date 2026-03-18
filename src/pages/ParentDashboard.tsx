import { useEffect, useState } from "react";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlMascot } from "@/components/OwlMascot";
import { Plus, LogOut, BookOpen, Star, Clock, Gift, Check, X, ChevronRight, Copy, Key, UserPlus, Mail, Home } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useChildren, ChildWithStats } from "@/hooks/useChildren";
import { useRewards } from "@/hooks/useRewards";

export default function ParentDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { children, loading: childrenLoading, refetch: refetchChildren, childIdsRef } = useChildren(user?.id);
  const { rewards, claims, refetch: refetchRewards } = useRewards(user?.id, childIdsRef.current);

  const [rewardOpen, setRewardOpen] = useState(false);
  const [pinDialogChild, setPinDialogChild] = useState<ChildWithStats | null>(null);
  const [newPin, setNewPin] = useState("");
  const [newReward, setNewReward] = useState({ name: "", description: "", point_cost: "100" });
  const [coParentEmail, setCoParentEmail] = useState("");
  const [coParentOpen, setCoParentOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [addingReward, setAddingReward] = useState(false);
  const [claimLoading, setClaimLoading] = useState<string | null>(null);

  const loading = childrenLoading;

  // Payment success tracking
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: `PF_${Math.random().toString(36).substr(2, 9)}`,
          value: 199.99,
          currency: 'ZAR',
          items: [{ item_id: 'sub_monthly_199', item_name: 'AI Kids Tutor Monthly Subscription', price: 199.99, quantity: 1 }]
        });
      }
      if (window.posthog) {
        window.posthog.capture('Subscription Started', { amount: 199.99, currency: 'ZAR', plan: 'Monthly' });
      }
      toast.success("Payment successful! 🎉 Your subscription is now active.");
      window.history.replaceState({}, document.title, "/parent");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Realtime subscription for XP notifications
  useEffect(() => {
    if (childIdsRef.current.length === 0) return;

    const channel = supabase
      .channel("parent-points-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "points" },
        (payload) => {
          const newPoint = payload.new as { child_id: string; amount: number; reason: string };
          if (childIdsRef.current.includes(newPoint.child_id)) {
            const childName = children.find((c) => c.id === newPoint.child_id)?.name || "Your child";
            if (newPoint.amount < 0) {
              toast.info(`${childName} spent ${Math.abs(newPoint.amount)} XP — ${newPoint.reason} 🎁`);
            } else {
              toast.info(`${childName} earned ${newPoint.amount} XP for ${newPoint.reason}! ⭐`);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reward_claims" },
        (payload) => {
          const claim = payload.new as { child_id: string; reward_id: string };
          if (childIdsRef.current.includes(claim.child_id)) {
            const childName = children.find((c) => c.id === claim.child_id)?.name || "Your child";
            const rewardName = rewards.find((r) => r.id === claim.reward_id)?.name || "a reward";
            toast.info(`${childName} just claimed "${rewardName}"! 🎁`, { duration: 5000 });
            refetchChildren();
            refetchRewards();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [children]);

  const addReward = async () => {
    if (!user || !newReward.name.trim()) return;
    setAddingReward(true);
    const { error } = await supabase.from("rewards").insert({
      parent_id: user.id,
      name: newReward.name.trim(),
      description: newReward.description.trim() || null,
      point_cost: parseInt(newReward.point_cost) || 100,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Reward created!");
      setNewReward({ name: "", description: "", point_cost: "100" });
      setRewardOpen(false);
      refetchRewards();
    }
    setAddingReward(false);
  };

  const handleClaim = async (claimId: string, status: "approved" | "denied") => {
    setClaimLoading(claimId);
    const { error } = await supabase.from("reward_claims").update({ status, reviewed_at: new Date().toISOString() }).eq("id", claimId);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "approved" ? "Reward approved! 🎉" : "Claim denied");
      refetchRewards();
    }
    setClaimLoading(null);
  };

  const copyKidLink = (childId: string) => {
    const link = `${window.location.origin}/child/${childId}`;
    navigator.clipboard.writeText(link);
    toast.success("Kid link copied! 📋");
  };

  const saveChildPin = async () => {
    if (!pinDialogChild || newPin.length !== 4) return;
    const { error } = await supabase.from("children").update({ access_pin: newPin } as any).eq("id", pinDialogChild.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`PIN set for ${pinDialogChild.name}!`);
      setPinDialogChild(null);
      setNewPin("");
      refetchChildren();
    }
  };

  const inviteCoParent = async () => {
    if (!user || !coParentEmail.trim()) return;
    setInviting(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-coparent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ email: coParentEmail.trim(), parent_id: user.id }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to invite");
      toast.success(data.message || "Invitation sent!");
      setCoParentEmail("");
      setCoParentOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Could not send invitation");
    } finally {
      setInviting(false);
    }
  };

  const getChildName = (id: string) => children.find((c) => c.id === id)?.name || "Child";
  const getRewardName = (id: string) => rewards.find((r) => r.id === id)?.name || "Reward";
  const pendingClaims = claims.filter((c) => c.status === "pending");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <OwlMascot size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <OwlMascot size="sm" animate={false} />
          <span className="font-display font-bold text-lg">Parent Dashboard</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
          <LogOut className="w-4 h-4 mr-1" /> Sign Out
        </Button>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="children">
          <TabsList className="w-full">
            <TabsTrigger value="children" className="flex-1">Children</TabsTrigger>
            <TabsTrigger value="rewards" className="flex-1 relative">
              Rewards
              {pendingClaims.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-destructive text-destructive-foreground">
                  {pendingClaims.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Your Children</h2>
              <Button size="sm" onClick={() => navigate("/parent/add-child")}>
                <Plus className="w-4 h-4 mr-1" /> Add Child
              </Button>
            </div>

            {/* Invite Co-Parent */}
            <Card className="border-dashed border-2 border-muted-foreground/20">
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Invite Co-Parent</p>
                    <p className="text-xs text-muted-foreground">Share access with a partner or family member</p>
                  </div>
                </div>
                <Dialog open={coParentOpen} onOpenChange={setCoParentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline"><Mail className="w-4 h-4 mr-1" /> Invite</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Invite Co-Parent</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter their email address. They'll receive an invitation to join and access your children's profiles.
                      </p>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          placeholder="partner@example.com"
                          value={coParentEmail}
                          onChange={(e) => setCoParentEmail(e.target.value)}
                        />
                      </div>
                      <Button className="w-full" onClick={inviteCoParent} disabled={inviting || !coParentEmail.trim()}>
                        {inviting ? "Sending..." : "Send Invitation"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {children.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <OwlMascot size="lg" message="Add your first child to get started!" className="mx-auto" />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {children.map((child) => (
                  <Card key={child.id} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-xl flex items-center justify-between">
                        <div className="flex items-center gap-2" onClick={() => navigate(`/child/${child.id}`)}>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {child.name[0]}
                          </div>
                          {child.name}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => { e.stopPropagation(); navigate(`/parent/child/${child.id}`); }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Year {child.grade}</span>
                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary">
                          {child.selected_curriculum || "cambridge"}
                        </span>
                        <span className="flex items-center gap-1"><Star className="w-4 h-4 text-star-gold" /> {child.totalPoints} pts</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {child.sessionCount} sessions</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={(e) => { e.stopPropagation(); copyKidLink(child.id); }}>
                          <Copy className="w-3 h-3 mr-1" /> Copy Kid Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={(e) => { e.stopPropagation(); setPinDialogChild(child); setNewPin(child.access_pin || ""); }}
                        >
                          <Key className="w-3 h-3 mr-1" /> {child.access_pin ? "Change PIN" : "Set PIN"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4 mt-4">
            {pendingClaims.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display text-lg font-semibold">Pending Approvals</h3>
                {pendingClaims.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{getChildName(c.child_id)} wants: <span className="text-primary">{getRewardName(c.reward_id)}</span></p>
                        <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 text-accent" onClick={() => handleClaim(c.id, "approved")} disabled={claimLoading === c.id}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => handleClaim(c.id, "denied")} disabled={claimLoading === c.id}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Reward Catalog</h3>
              <Dialog open={rewardOpen} onOpenChange={setRewardOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Reward</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Create a Reward</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reward Name</Label>
                      <Input placeholder="e.g. Pizza Night" value={newReward.name} onChange={(e) => setNewReward({ ...newReward, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Input placeholder="e.g. Choose any pizza for dinner" value={newReward.description} onChange={(e) => setNewReward({ ...newReward, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Point Cost</Label>
                      <Input type="number" value={newReward.point_cost} onChange={(e) => setNewReward({ ...newReward, point_cost: e.target.value })} />
                    </div>
                    <Button className="w-full" onClick={addReward} disabled={addingReward}>{addingReward ? "Creating..." : "Create Reward"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {rewards.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8">
                  <Gift className="w-12 h-12 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No rewards yet. Create rewards to motivate your children!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {rewards.map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-star-gold fill-star-gold" />
                        <span className="text-sm font-display font-medium">{r.point_cost}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="account" className="space-y-4 mt-4">
            <h2 className="font-display text-2xl font-bold">Account</h2>
            <SubscriptionManager />
          </TabsContent>
        </Tabs>
      </main>

      {/* Set Child PIN dialog */}
      <Dialog open={!!pinDialogChild} onOpenChange={() => setPinDialogChild(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {pinDialogChild?.access_pin ? "Change" : "Set"} PIN for {pinDialogChild?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Set a 4-digit PIN so {pinDialogChild?.name} can log in independently at <strong>/child-login</strong>
            </p>
            <InputOTP value={newPin} onChange={setNewPin} maxLength={4}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={saveChildPin} disabled={newPin.length !== 4} className="w-full">Save PIN</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
