import { useState, useEffect, useCallback } from "react";
import { childApi } from "@/lib/childApi";
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

    try {
      const data = await childApi.getMissionProgress(childId, curriculum, grade);
      const activities = data.activities || [];
      const progress = data.progress || [];

      if (!activities.length) { setLevels([]); setLoading(false); return; }

      const progressMap = new Map<string, any>();
      progress.forEach((p: any) => progressMap.set(p.activity_id, p));

      let foundCurrent = false;
      const built: MissionLevel[] = activities.map((act: any) => {
        const prog = progressMap.get(act.id);
        let status: "locked" | "current" | "completed" = "locked";

        if (prog) {
          status = prog.status as any;
        } else if (!foundCurrent) {
          status = "current";
          foundCurrent = true;
        }

        return {
          activity: { ...act, objectives: act.objectives || [] },
          status,
          progressId: prog?.id,
        };
      });

      if (!built.some(l => l.status === "current")) {
        const firstLocked = built.find(l => l.status === "locked");
        if (firstLocked) firstLocked.status = "current";
      }

      setLevels(built);
    } catch (err: any) {
      console.error("Mission progress error:", err.message);
    }

    setLoading(false);
  }, [childId, curriculum, grade]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeActivity = useCallback(async (activityId: string, sessionId?: string) => {
    if (!childId) return;

    const level = levels.find(l => l.activity.id === activityId);
    if (!level) return;

    const currentIdx = levels.findIndex(l => l.activity.id === activityId);
    const nextActivity = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;

    try {
      await childApi.completeActivity(childId, {
        activity_id: activityId,
        session_id: sessionId,
        xp_reward: level.activity.xp_reward,
        topic: level.activity.topic,
        next_activity_id: nextActivity?.activity.id,
      });

      toast.success(`+${level.activity.xp_reward} XP! Mission complete! 🎉`);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ["#4a8c5c", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"] });
      fetchData();
    } catch (err: any) {
      console.error("Complete activity error:", err.message);
    }
  }, [childId, levels, fetchData]);

  return { levels, loading, completeActivity, refetch: fetchData };
}
