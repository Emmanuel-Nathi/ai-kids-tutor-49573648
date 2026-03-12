import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OwlMascot } from "@/components/OwlMascot";
import { ArrowLeft, Star, Gift } from "lucide-react";

export default function ChildRewards() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/child/${childId}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-bold text-lg">🎁 Rewards Store</span>
      </header>
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 bg-star-gold/20 rounded-full px-6 py-3">
            <Star className="w-6 h-6 text-star-gold fill-star-gold" />
            <span className="font-display text-2xl font-bold">0 Points</span>
          </div>
        </div>
        <OwlMascot size="md" message="Keep learning to earn more points! ⭐" className="mx-auto" />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <Gift className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No rewards available yet. Ask your parent to set some up!</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
