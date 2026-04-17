import { useParams } from "react-router-dom";
import { useRequireChildSession } from "@/hooks/useChildSession";
import { useAchievementRoom } from "@/hooks/useAchievementRoom";
import OwlScene from "@/components/OwlScene";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Flame, BookOpen, Lock, Trophy, ShoppingBag, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export default function AchievementRoom() {
  const { childId } = useParams<{ childId: string }>();
  useRequireChildSession();
  const {
    child,
    totalPoints,
    streak,
    sessionCount,
    allItems,
    ownedItems,
    availableItems,
    equippedItems,
    allBadges,
    earnedBadges,
    loading,
    toggleEquip,
    purchaseItem,
  } = useAchievementRoom(childId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground font-display">Loading your room...</p>
      </div>
    );
  }

  const earnedBadgeIds = new Set(earnedBadges.map((eb) => eb.badge_id));
  const ownedItemIds = new Set(ownedItems.map((o) => o.item_id));


  return (
    <TooltipProvider delayDuration={150}>
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Trophy className="w-5 h-5 text-primary" />
        <span className="font-display font-bold text-lg">{child?.name}'s Room</span>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-4">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Owl Display — spans 2 cols on desktop */}
          <Card className="md:col-span-2 overflow-hidden relative">
            <CardContent className="p-0">
              <OwlScene
                equippedItems={equippedItems}
                message={Object.keys(equippedItems).length > 0 ? "Looking stylish! 😎" : "Visit the closet to dress me up!"}
              />
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-card/80 backdrop-blur-md border border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-[hsl(var(--star-gold))]" />
                <div>
                  <p className="font-display font-bold text-xl">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-primary fill-primary" />
                <div>
                  <p className="font-display font-bold text-xl">{streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-display font-bold text-xl">{sessionCount}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Shelf */}
        <Card className="bg-card/80 backdrop-blur-md border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" /> Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No badges available yet. Keep learning!</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {allBadges.map((badge) => {
                  const earned = earnedBadgeIds.has(badge.id);
                  const tooltipText = earned
                    ? badge.description || "Earned!"
                    : badge.description ||
                      (badge.criteria_type
                        ? `Earn by: ${badge.criteria_type.replace(/_/g, " ")} ${badge.criteria_value ?? ""}`
                        : "Keep learning to unlock!");
                  return (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.08, y: -2 }}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-help relative overflow-hidden ${
                            earned
                              ? "bg-gradient-to-br from-secondary/30 to-primary/15 border-secondary/40 shadow-lg ring-1 ring-white/40"
                              : "bg-muted/30 border-border opacity-50 grayscale"
                          }`}
                          style={
                            earned
                              ? { boxShadow: "inset 0 1px 4px hsl(0 0% 100% / 0.5), 0 4px 14px hsl(var(--secondary) / 0.25)" }
                              : undefined
                          }
                        >
                          {earned && (
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/30 pointer-events-none" />
                          )}
                          <span className="text-3xl drop-shadow-sm relative z-10">{earned ? badge.icon_emoji : "🔒"}</span>
                          <span className="text-[10px] font-display font-semibold text-center leading-tight relative z-10">
                            {badge.title}
                          </span>
                          {earned && (
                            <Badge variant="secondary" className="text-[8px] px-1.5 py-0 relative z-10">
                              Earned
                            </Badge>
                          )}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-xs">
                        <p className="font-display font-bold mb-0.5">{badge.title}</p>
                        <p>{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Item Closet */}
        <Card className="bg-card/80 backdrop-blur-md border border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Item Closet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No items in the shop yet!</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allItems.map((item) => {
                  const owned = ownedItemIds.has(item.id);
                  const equipped = equippedItems[item.item_type] === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.03 }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        equipped
                          ? "bg-primary/10 border-primary/40 shadow-lg ring-2 ring-primary/20"
                          : owned
                          ? "bg-card border-border shadow-sm"
                          : "bg-muted/20 border-dashed border-border"
                      }`}
                    >
                      <span className="text-3xl">{item.icon_emoji}</span>
                      <span className="text-xs font-display font-semibold text-center">{item.name}</span>
                      <Badge variant="outline" className="text-[9px]">
                        {item.item_type}
                      </Badge>

                      {owned ? (
                        <Button
                          size="sm"
                          variant={equipped ? "default" : "outline"}
                          className="w-full text-xs mt-1"
                          onClick={() => toggleEquip(item.id, item.item_type)}
                        >
                          {equipped ? (
                            <>
                              <Check className="w-3 h-3 mr-1" /> Equipped
                            </>
                          ) : (
                            "Equip"
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs mt-1"
                          onClick={() => purchaseItem(item.id, item.xp_cost)}
                        >
                          <Star className="w-3 h-3 mr-1" /> {item.xp_cost} XP
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
    </TooltipProvider>
  );
}
