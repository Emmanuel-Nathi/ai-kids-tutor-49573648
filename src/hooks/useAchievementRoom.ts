import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { childApi } from "@/lib/childApi";
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

    try {
      const data = await childApi.getAchievementRoom(childId);
      setAllItems(data.items as unknown as InventoryItem[]);
      setOwnedItems(data.owned as unknown as OwnedItem[]);
      setAllBadges(data.badges as unknown as Badge[]);
      setEarnedBadges(data.earned as unknown as EarnedBadge[]);
    } catch (err: any) {
      console.error("Achievement room error:", err.message);
    }

    setLoading(false);
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ownedItemIds = new Set(ownedItems.map((o) => o.item_id));
  const availableItems = allItems.filter((item) => !ownedItemIds.has(item.id));

  const toggleEquip = async (itemId: string, itemType: string) => {
    if (!childId) return;
    try {
      await childApi.toggleEquip(childId, itemId, itemType);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const purchaseItem = async (itemId: string, cost: number) => {
    if (!childId) return;
    if (totalPoints < cost) {
      toast.error("Not enough XP to buy this item!");
      return;
    }

    try {
      await childApi.purchaseItem(childId, itemId);
      toast.success("Item purchased! 🎉");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase item");
    }
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
