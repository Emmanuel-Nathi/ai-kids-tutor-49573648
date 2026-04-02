import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface Activity {
  id: string;
  topic: string;
  grade: string;
  curriculum: string;
  subject: string;
  objectives: string[];
  difficulty: number;
  xp_reward: number;
  sort_order: number;
  is_active: boolean;
}

interface ProgressEntry {
  id: string;
  child_id: string;
  activity_id: string;
  status: "locked" | "current" | "completed";
  completed_at: string | null;
  session_id: string | null;
}

export interface MissionLevel {
  activity: Activity;
  status: "locked" | "current" | "completed";
  progressId?: string;
}

export function useMissionProgress(childId: string | undefined, curriculum: string, grade: string) {
  const [levels, setLevels] = useState<MissionLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!childId || !grade) return;
    setLoading(true);

    const { data: activities, error: actErr } = await supabase
      .from("activities")
      .select("*")
      .eq("curriculum", curriculum)
      .eq("grade", grade)
      .eq("is_active", true)
      .order("sort_order");

    if (actErr) { console.error(actErr); setLoading(false); return; }
    if (!activities?.length) { setLevels([]); setLoading(false); return; }

    const { data: progress } = await supabase
      .from("child_activity_progress")
      .select("*")
      .eq("child_id", childId)
      .in("activity_id", activities.map(a => a.id));

    const progressMap = new Map<string, any>();
    (progress || []).forEach((p: any) => progressMap.set(p.activity_id, p));

    // Build levels: first without progress is "current", rest are "locked"
    let foundCurrent = false;
    const built: MissionLevel[] = activities.map((act: any) => {
      const prog = progressMap.get(act.id);
      let status: "locked" | "current" | "completed" = "locked";

      if (prog) {
        status = prog.status as any;
      } else if (!foundCurrent) {
        // First activity without progress = current (auto-initialize)
        status = "current";
        foundCurrent = true;
      }

      return {
        activity: { ...act, objectives: act.objectives || [] },
        status,
        progressId: prog?.id,
      };
    });

    // If no "current" found and there are locked items, make the first locked one current
    if (!built.some(l => l.status === "current")) {
      const firstLocked = built.find(l => l.status === "locked");
      if (firstLocked) firstLocked.status = "current";
    }

    setLevels(built);
    setLoading(false);
  }, [childId, curriculum, grade]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeActivity = useCallback(async (activityId: string, sessionId?: string) => {
    if (!childId) return;

    const level = levels.find(l => l.activity.id === activityId);
    if (!level) return;

    // Upsert progress as completed
    const { error } = await supabase.from("child_activity_progress").upsert({
      child_id: childId,
      activity_id: activityId,
      status: "completed",
      completed_at: new Date().toISOString(),
      session_id: sessionId || null,
    }, { onConflict: "child_id,activity_id" });

    if (error) { console.error(error); return; }

    // Award XP
    const xp = level.activity.xp_reward;
    await supabase.from("points").insert({
      child_id: childId,
      amount: xp,
      reason: `🏆 Completed mission: ${level.activity.topic}`,
    });
    toast.success(`+${xp} XP! Mission complete! 🎉`);

    // Unlock next activity
    const currentIdx = levels.findIndex(l => l.activity.id === activityId);
    if (currentIdx < levels.length - 1) {
      const next = levels[currentIdx + 1];
      await supabase.from("child_activity_progress").upsert({
        child_id: childId,
        activity_id: next.activity.id,
        status: "current",
      }, { onConflict: "child_id,activity_id" });
    }

    fetchData();
  }, [childId, levels, fetchData]);

  return { levels, loading, completeActivity, refetch: fetchData };
}
