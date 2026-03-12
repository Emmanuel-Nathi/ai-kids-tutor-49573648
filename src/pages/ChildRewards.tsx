import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkle } from "@/components/Sparkle";
import { ArrowLeft, Star, Gift, Check, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
}

interface Claim {
  id: string;
  reward_id: string;
  status: string;
  created_at: string;
  reward_name?: string;
}

export default function ChildRewards() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [totalPoints, setTotalPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    if (childId) fetchData();
  }, [childId]);

  const fetchData = async () => {
    // Get points
    const { data: pts } = await supabase.from("points").select("amount").eq("child_id", childId!);
    const total = (pts || []).reduce((s, p) => s + p.amount, 0);
    setTotalPoints(total);

    // Get child's parent_id to fetch rewards
    const { data: child } = await supabase.from("children").select("parent_id").eq("id", childId!).single();
    if (child) {
      const { data: rw } = await supabase.from("rewards").select("*").eq("parent_id", child.parent_id).eq("is_active", true);
      setRewards(rw || []);
    }

    // Get claims
    const { data: cl } = await supabase
      .from("reward_claims")
      .select("id, reward_id, status, created_at")
      .eq("child_id", childId!)
      .order("created_at", { ascending: false });

    setClaims(cl || []);
  };

  const claimReward = async (reward: Reward) => {
    if (totalPoints < reward.point_cost) {
      toast.error(`You need ${reward.point_cost - totalPoints} more points!`);
      return;
    }
    const { error } = await supabase.from("reward_claims").insert({
      child_id: childId!,
      reward_id: reward.id,
      status: "pending",
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Reward claimed! Waiting for parent approval 🎉");
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1500);
      fetchData();
    }
  };

  const getRewardName = (rewardId: string) => rewards.find((r) => r.id === rewardId)?.name || "Reward";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/child/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">🎁 Rewards Store</span>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center pt-4 relative"
        >
          <div className="inline-flex items-center gap-2 bg-star-gold/20 rounded-full px-6 py-3 relative">
            <Star className="w-6 h-6 text-star-gold fill-star-gold" />
            <span className="font-display text-2xl font-bold">{totalPoints} Points</span>
            <Sparkle active={showSparkle} />
          </div>
        </motion.div>

        <OwlMascot
          size="md"
          variant={showSparkle ? "celebrate" : "idle"}
          message={totalPoints > 0 ? "Great work! Check out your rewards! ⭐" : "Keep learning to earn more points! ⭐"}
          className="mx-auto"
        />

        {/* Available rewards */}
        {rewards.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-display font-semibold">Available Rewards</h3>
            {rewards.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-display font-medium">{r.name}</p>
                    {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-star-gold fill-star-gold" />
                      <span className="text-xs font-medium">{r.point_cost} pts</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={totalPoints < r.point_cost}
                    onClick={() => claimReward(r)}
                  >
                    Claim
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <Gift className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No rewards available yet. Ask your parent to set some up!</p>
            </CardContent>
          </Card>
        )}

        {/* Claims history */}
        {claims.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold">Your Claims</h3>
            {claims.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div>
                  <p className="text-sm font-medium">{getRewardName(c.reward_id)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-display px-2 py-1 rounded-full ${
                  c.status === "approved" ? "bg-accent/20 text-accent" :
                  c.status === "denied" ? "bg-destructive/20 text-destructive" :
                  "bg-star-gold/20 text-foreground"
                }`}>
                  {c.status === "pending" ? "⏳ Pending" : c.status === "approved" ? "✅ Approved" : "❌ Denied"}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
