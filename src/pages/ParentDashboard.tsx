import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwlMascot } from "@/components/OwlMascot";
import { Plus, LogOut, BookOpen, Star, Clock, Gift, Check, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Child {
  id: string;
  name: string;
  grade: string;
  curriculum_level: string;
  avatar_url: string | null;
  selected_curriculum: string;
  preferred_language: string;
}

interface ChildWithStats extends Child {
  totalPoints: number;
  sessionCount: number;
}

interface RewardClaim {
  id: string;
  child_id: string;
  reward_id: string;
  status: string;
  created_at: string;
  child_name?: string;
  reward_name?: string;
  point_cost?: number;
}

interface Reward {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
  is_active: boolean;
}

export default function ParentDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", grade: "1", curriculum_level: "primary", selected_curriculum: "cambridge", preferred_language: "english" });
  const [newReward, setNewReward] = useState({ name: "", description: "", point_cost: "100" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    // Children
    const { data: childrenData } = await supabase.from("children").select("*").order("created_at");
    
    // Enrich with stats
    const enriched: ChildWithStats[] = [];
    for (const c of childrenData || []) {
      const { data: pts } = await supabase.from("points").select("amount").eq("child_id", c.id);
      const { count } = await supabase.from("sessions").select("*", { count: "exact", head: true }).eq("child_id", c.id);
      enriched.push({
        ...c,
        totalPoints: (pts || []).reduce((s, p) => s + p.amount, 0),
        sessionCount: count || 0,
      });
    }
    setChildren(enriched);

    // Rewards
    if (user) {
      const { data: rw } = await supabase.from("rewards").select("*").eq("parent_id", user.id).order("created_at");
      setRewards(rw || []);
    }

    // Pending claims
    const childIds = (childrenData || []).map((c) => c.id);
    if (childIds.length > 0) {
      const { data: cl } = await supabase
        .from("reward_claims")
        .select("*")
        .in("child_id", childIds)
        .order("created_at", { ascending: false });
      setClaims(cl || []);
    }

    setLoading(false);
  };

  const addChild = async () => {
    if (!user || !newChild.name.trim()) return;
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: newChild.name.trim(),
      grade: newChild.grade,
      curriculum_level: newChild.curriculum_level,
      selected_curriculum: newChild.selected_curriculum,
      preferred_language: newChild.preferred_language,
    } as any);
    if (error) toast.error(error.message);
    else {
      toast.success(`${newChild.name} added!`);
      setNewChild({ name: "", grade: "1", curriculum_level: "primary", selected_curriculum: "cambridge", preferred_language: "english" });
      setAddOpen(false);
      fetchAll();
    }
  };

  const addReward = async () => {
    if (!user || !newReward.name.trim()) return;
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
      fetchAll();
    }
  };

  const handleClaim = async (claimId: string, status: "approved" | "denied") => {
    const { error } = await supabase
      .from("reward_claims")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", claimId);
    if (error) toast.error(error.message);
    else {
      toast.success(status === "approved" ? "Reward approved! 🎉" : "Claim denied");
      fetchAll();
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
          </TabsList>

          <TabsContent value="children" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Your Children</h2>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Child</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">Add a Child</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Child's Name</Label>
                      <Input placeholder="e.g. Sarah" value={newChild.name} onChange={(e) => setNewChild({ ...newChild, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade / Year</Label>
                      <Select value={newChild.grade} onValueChange={(v) => setNewChild({ ...newChild, grade: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>Year {i + 1}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Curriculum Level</Label>
                      <Select value={newChild.curriculum_level} onValueChange={(v) => setNewChild({ ...newChild, curriculum_level: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="lower_secondary">Lower Secondary</SelectItem>
                          <SelectItem value="upper_secondary">Upper Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Curriculum</Label>
                      <Select value={newChild.selected_curriculum} onValueChange={(v) => setNewChild({ ...newChild, selected_curriculum: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cambridge">Cambridge International</SelectItem>
                          <SelectItem value="caps">CAPS (South Africa)</SelectItem>
                          <SelectItem value="ieb">IEB (South Africa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(newChild.selected_curriculum === "caps" || newChild.selected_curriculum === "ieb") && (
                      <div className="space-y-2">
                        <Label>Preferred Language</Label>
                        <Select value={newChild.preferred_language} onValueChange={(v) => setNewChild({ ...newChild, preferred_language: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="afrikaans">Afrikaans</SelectItem>
                            <SelectItem value="isizulu">isiZulu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button className="w-full" onClick={addChild}>Add Child</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {children.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <OwlMascot size="lg" message="Add your first child to get started!" className="mx-auto" />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {children.map((child) => (
                  <Card
                    key={child.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30"
                    onClick={() => navigate(`/child/${child.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="font-display text-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                    <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Year {child.grade}</span>
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-star-gold" /> {child.totalPoints} pts</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {child.sessionCount} sessions</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4 mt-4">
            {/* Pending claims */}
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
                        <Button size="icon" variant="outline" className="h-8 w-8 text-accent" onClick={() => handleClaim(c.id, "approved")}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive" onClick={() => handleClaim(c.id, "denied")}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Reward management */}
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
                    <Button className="w-full" onClick={addReward}>Create Reward</Button>
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
        </Tabs>
      </main>
    </div>
  );
}
