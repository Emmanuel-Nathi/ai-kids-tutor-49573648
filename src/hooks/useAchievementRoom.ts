import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildData } from "@/hooks/useChildData";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  item_type: string;
  xp_cost: number;
  material_effect: string | null;
  icon_emoji: string | null;
  is_active: boolean;
}

interface OwnedItem {
  id: string;
  child_id: string;
  item_id: string;
  is_equipped: boolean;
  purchased_at: string;
  inventory_items: InventoryItem;
}

interface Badge {
  id: string;
  title: string;
  description: string | null;
  icon_emoji: string | null;
  xp_award: number;
  criteria_type: string | null;
  criteria_value: number | null;
  is_active: boolean;
}

interface EarnedBadge {
  id: string;
  child_id: string;
  badge_id: string;
  earned_at: string;
  badges: Badge;
}

export function useAchievementRoom(childId: string | undefined) {
  const { child, totalPoints, streak, sessionCount, loading: childLoading } = useChildData(childId);
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>([]);
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const equippedItems: Record<string, string> = {};
  ownedItems.forEach((item) => {
    if (item.is_equipped) {
      equippedItems[item.inventory_items.item_type] = item.item_id;
    }
  });

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);

    const [itemsRes, ownedRes, badgesRes, earnedRes] = await Promise.all([
      supabase.from("inventory_items").select("*").eq("is_active", true),
      supabase.from("child_inventory").select("*, inventory_items(*)").eq("child_id", childId),
      supabase.from("badges").select("*").eq("is_active", true),
      supabase.from("child_badges").select("*, badges(*)").eq("child_id", childId),
    ]);

    if (itemsRes.data) setAllItems(itemsRes.data as unknown as InventoryItem[]);
    if (ownedRes.data) setOwnedItems(ownedRes.data as unknown as OwnedItem[]);
    if (badgesRes.data) setAllBadges(badgesRes.data as unknown as Badge[]);
    if (earnedRes.data) setEarnedBadges(earnedRes.data as unknown as EarnedBadge[]);

    setLoading(false);
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ownedItemIds = new Set(ownedItems.map((o) => o.item_id));
  const availableItems = allItems.filter((item) => !ownedItemIds.has(item.id));

  const toggleEquip = async (itemId: string, itemType: string) => {
    if (!childId) return;
    const isCurrentlyEquipped = equippedItems[itemType] === itemId;

    // Un-equip all items of same type first
    const sameTypeOwned = ownedItems.filter(
      (o) => o.inventory_items.item_type === itemType
    );
    for (const item of sameTypeOwned) {
      await supabase
        .from("child_inventory")
        .update({ is_equipped: false })
        .eq("id", item.id);
    }

    if (!isCurrentlyEquipped) {
      await supabase
        .from("child_inventory")
        .update({ is_equipped: true })
        .eq("child_id", childId)
        .eq("item_id", itemId);
    }

    await fetchData();
  };

  const purchaseItem = async (itemId: string, cost: number) => {
    if (!childId) return;
    if (totalPoints < cost) {
      toast.error("Not enough XP to buy this item!");
      return;
    }

    // Deduct points
    const { error: pointsError } = await supabase.from("points").insert({
      child_id: childId,
      amount: -cost,
      reason: "Item purchase",
    });

    if (pointsError) {
      toast.error("Failed to deduct XP");
      return;
    }

    // Add to inventory
    const { error: invError } = await supabase.from("child_inventory").insert({
      child_id: childId,
      item_id: itemId,
      is_equipped: false,
    });

    if (invError) {
      toast.error("Failed to purchase item");
      return;
    }

    toast.success("Item purchased! 🎉");
    await fetchData();
  };

  return {
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
    loading: loading || childLoading,
    toggleEquip,
    purchaseItem,
    refetch: fetchData,
  };
}
