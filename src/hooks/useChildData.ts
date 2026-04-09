import { useEffect, useState, useCallback } from "react";
import { childApi } from "@/lib/childApi";
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
  const [child, setChild] = useState<Tables<"children_safe"> | null>(null);
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
      const data = await childApi.getDashboard(childId);

      setChild(data.child);
      setTotalPoints(
        (data.points || []).reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)
      );
      setSessionCount(data.sessions?.length || 0);
      setStreak(calculateStreak(data.logins || []));
      setClaims(data.claims || []);
      setRewards(data.rewards || []);
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
