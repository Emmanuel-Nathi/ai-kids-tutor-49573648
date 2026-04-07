import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  point_cost: number;
}

export interface Claim {
  id: string;
  reward_id: string;
  status: string;
  created_at: string;
}

function calculateStreak(logins: { login_date: string }[]): number {
  if (!logins || logins.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let count = 0;
  for (let i = 0; i < logins.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const loginDate = new Date(logins[i].login_date + "T00:00:00");
    if (loginDate.getTime() === expected.getTime()) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

export function useChildData(childId: string | undefined) {
  const [child, setChild] = useState<Tables<"children"> | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [childRes, pointsRes, sessionsRes, claimsRes, loginsRes] = await Promise.all([
        supabase.from("children_safe").select("*").eq("id", childId).single(),
        supabase.from("points").select("amount").eq("child_id", childId),
        supabase
          .from("sessions")
          .select("id, started_at")
          .eq("child_id", childId)
          .order("started_at", { ascending: false }),
        supabase
          .from("reward_claims")
          .select("id, reward_id, status, created_at")
          .eq("child_id", childId)
          .order("created_at", { ascending: false }),
        supabase
          .from("daily_logins")
          .select("login_date")
          .eq("child_id", childId)
          .order("login_date", { ascending: false })
          .limit(60),
      ]);

      if (childRes.error) throw childRes.error;

      const childData = childRes.data;
      setChild(childData);
      setTotalPoints(
        (pointsRes.data || []).reduce((sum, p) => sum + p.amount, 0)
      );
      setSessionCount(sessionsRes.data?.length || 0);
      setStreak(calculateStreak((loginsRes.data as any) || []));
      setClaims(claimsRes.data || []);

      // Fetch rewards using parent_id from child
      if (childData?.parent_id) {
        const { data: rw } = await supabase
          .from("rewards")
          .select("id, name, description, point_cost")
          .eq("parent_id", childData.parent_id)
          .eq("is_active", true)
          .order("point_cost", { ascending: true });
        setRewards(rw || []);
      }
    } catch (err: any) {
      console.error("useChildData error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    child,
    totalPoints,
    streak,
    sessionCount,
    rewards,
    claims,
    loading,
    error,
    refetch: fetchAll,
  };
}
