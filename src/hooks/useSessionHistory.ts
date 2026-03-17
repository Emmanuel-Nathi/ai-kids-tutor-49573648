import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isToday, format } from "date-fns";

export interface SessionWithMessages {
  id: string;
  subject: string | null;
  started_at: string;
  ended_at: string | null;
  active_time_seconds: number;
  idle_time_seconds: number;
  status: string;
  interaction_summary: string | null;
  curriculum_alignment_score: number | null;
  messages: { role: string; content: string; created_at: string }[];
}

export interface ActivityLogItem {
  type: "points" | "session" | "homework" | "reward_claim";
  timestamp: string;
  title: string;
  detail: string;
  emoji: string;
}

export function useSessionHistory(childId: string | undefined, enabled: boolean) {
  const [childName, setChildName] = useState("");
  const [sessions, setSessions] = useState<SessionWithMessages[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!childId) return;
    setLoading(true);

    const { data: child } = await supabase.from("children").select("name").eq("id", childId).single();
    setChildName(child?.name || "");

    const { data: sessionsData } = await supabase.from("sessions").select("*").eq("child_id", childId).order("started_at", { ascending: false });

    const sessionIds = (sessionsData || []).map((s) => s.id);
    let allMsgs: { role: string; content: string; created_at: string; session_id: string }[] = [];
    if (sessionIds.length > 0) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("role, content, created_at, session_id")
        .in("session_id", sessionIds)
        .order("created_at");
      allMsgs = msgs || [];
    }

    const msgsBySession = allMsgs.reduce((acc, m) => {
      if (!acc[m.session_id]) acc[m.session_id] = [];
      acc[m.session_id].push({ role: m.role, content: m.content, created_at: m.created_at });
      return acc;
    }, {} as Record<string, { role: string; content: string; created_at: string }[]>);

    const enriched: SessionWithMessages[] = (sessionsData || []).map((s) => ({
      ...s,
      messages: msgsBySession[s.id] || [],
    }));
    setSessions(enriched);

    const { data: pts } = await supabase.from("points").select("amount, reason, created_at").eq("child_id", childId).order("created_at", { ascending: false });
    setTotalPoints((pts || []).reduce((sum, p) => sum + p.amount, 0));

    const log: ActivityLogItem[] = [];

    for (const p of pts || []) {
      log.push({ type: "points", timestamp: p.created_at, title: `+${p.amount} XP`, detail: p.reason, emoji: "⭐" });
    }

    for (const s of sessionsData || []) {
      log.push({
        type: "session",
        timestamp: s.started_at,
        title: `${(s.subject || "General").replace(/_/g, " ")} session`,
        detail: s.status === "completed" ? "Completed" : "Active",
        emoji: s.subject === "math" ? "🔢" : s.subject === "english" ? "📖" : s.subject === "science" ? "🔬" : "🌍",
      });
    }

    const { data: hw } = await supabase.from("homework").select("created_at, status, subject").eq("child_id", childId).order("created_at", { ascending: false });
    for (const h of hw || []) {
      log.push({ type: "homework", timestamp: h.created_at, title: `Homework ${h.status}`, detail: h.subject || "Worksheet", emoji: "📸" });
    }

    const { data: rc } = await supabase.from("reward_claims").select("created_at, status, reward_id").eq("child_id", childId).order("created_at", { ascending: false });
    for (const r of rc || []) {
      log.push({ type: "reward_claim", timestamp: r.created_at, title: `Reward ${r.status}`, detail: "", emoji: "🎁" });
    }

    log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivityLog(log);
    setLoading(false);
  }, [childId]);

  useEffect(() => {
    if (enabled && childId) fetchData();
  }, [enabled, childId, fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!enabled || !childId) return;
    const channel = supabase
      .channel(`points-${childId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "points", filter: `child_id=eq.${childId}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [enabled, childId, fetchData]);

  const todayLog = useMemo(() => activityLog.filter((item) => isToday(new Date(item.timestamp))), [activityLog]);

  return { childName, sessions, totalPoints, activityLog, todayLog, loading, refetch: fetchData };
}
