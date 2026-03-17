import { useParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildData } from "@/hooks/useChildData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { Sparkle } from "@/components/Sparkle";
import { Star, Gift } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ChildRewards() {
  const { childId } = useParams<{ childId: string }>();
  const { totalPoints, rewards, claims, refetch } = useChildData(childId);
  const [showSparkle, setShowSparkle] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const claimReward = async (reward: { id: string; name: string; point_cost: number }) => {
    if (totalPoints < reward.point_cost) {
      toast.error(`You need ${reward.point_cost - totalPoints} more points!`);
      return;
    }
    setClaimingId(reward.id);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          child_id: childId,
          amount: -reward.point_cost,
          reason: `🎁 Redeemed: ${reward.name}`,
        }),
      });
      if (!resp.ok) throw new Error("Failed to deduct points");
    } catch {
      toast.error("Could not deduct points. Try again!");
      setClaimingId(null);
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
      window.posthog?.capture('reward_claimed', { child_id: childId, reward_name: reward.name, point_cost: reward.point_cost });
      window.gtag?.('event', 'reward_claim', { reward_name: reward.name, point_cost: reward.point_cost });
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1500);
      refetch();
    }
    setClaimingId(null);
  };

  const getRewardName = (rewardId: string) => rewards.find((r) => r.id === rewardId)?.name || "Reward";

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
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
          message={totalPoints > 0 ? "Great work! Check out your rewards! ⭐" : "Earn your first stars to unlock rewards! 🌟"}
          className="mx-auto"
        />

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
                    disabled={totalPoints < r.point_cost || claimingId === r.id}
                    onClick={() => claimReward(r)}
                  >
                    {claimingId === r.id ? "Claiming..." : "Claim"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <Gift className="w-12 h-12 text-muted-foreground/40" />
              <p className="font-display font-semibold text-foreground">Coming Soon!</p>
              <p className="text-sm text-muted-foreground">Ask your parent to set up some awesome rewards!</p>
            </CardContent>
          </Card>
        )}

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
