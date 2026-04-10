import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Child {
  id: string;
  name: string;
  grade: string;
  curriculum_level: string;
  avatar_url: string | null;
  selected_curriculum: string;
  preferred_language: string;
}

export interface ChildWithStats extends Child {
  totalPoints: number;
  sessionCount: number;
}

export function useChildren(userId: string | undefined) {
  const [children, setChildren] = useState<ChildWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const childIdsRef = useRef<string[]>([]);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data: childrenData } = await supabase
      .from("children")
      .select("id, name, grade, curriculum_level, avatar_url, selected_curriculum, preferred_language, created_at")
      .order("created_at");

    const childIds = (childrenData || []).map((c) => c.id);

    if (childIds.length === 0) {
      setChildren([]);
      childIdsRef.current = [];
      setLoading(false);
      return;
    }

    // Batch fetch points and session counts instead of N+1
    const [{ data: allPoints }, { data: allSessions }] = await Promise.all([
      supabase.from("points").select("child_id, amount").in("child_id", childIds),
      supabase.from("sessions").select("child_id").in("child_id", childIds),
    ]);

    const pointsByChild: Record<string, number> = {};
    for (const p of allPoints || []) {
      pointsByChild[p.child_id] = (pointsByChild[p.child_id] || 0) + p.amount;
    }

    const sessionsByChild: Record<string, number> = {};
    for (const s of allSessions || []) {
      sessionsByChild[s.child_id] = (sessionsByChild[s.child_id] || 0) + 1;
    }

    const enriched: ChildWithStats[] = (childrenData || []).map((c) => ({
      ...(c as any),
      totalPoints: pointsByChild[c.id] || 0,
      sessionCount: sessionsByChild[c.id] || 0,
    }));

    setChildren(enriched);
    childIdsRef.current = enriched.map((c) => c.id);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [userId, fetchAll]);

  return { children, loading, refetch: fetchAll, childIdsRef };
}
