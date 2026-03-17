import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
  is_active: boolean;
}

export interface RewardClaim {
  id: string;
  child_id: string;
  reward_id: string;
  status: string;
  created_at: string;
}

export function useRewards(userId: string | undefined, childIds: string[]) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const promises: Promise<any>[] = [
      supabase.from("rewards").select("*").eq("parent_id", userId).order("created_at"),
    ];

    if (childIds.length > 0) {
      promises.push(
        supabase.from("reward_claims").select("*").in("child_id", childIds).order("created_at", { ascending: false })
      );
    }

    const results = await Promise.all(promises);
    setRewards(results[0].data || []);
    setClaims(results[1]?.data || []);
    setLoading(false);
  }, [userId, childIds.join(",")]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [userId, fetchAll]);

  return { rewards, claims, loading, refetch: fetchAll };
}
