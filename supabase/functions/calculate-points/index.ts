import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Mode 1: Direct child_id + amount (for homework completion, activities, etc.)
    if (body.child_id && body.amount) {
      const { child_id, amount, reason = "Activity" } = body;

      const { error: pErr } = await supabase.from("points").insert({
        child_id,
        amount,
        reason,
      });
      if (pErr) throw pErr;

      // Get new total
      const { data: pts } = await supabase.from("points").select("amount").eq("child_id", child_id);
      const total = (pts || []).reduce((s: number, p: any) => s + p.amount, 0);

      return new Response(JSON.stringify({ points: amount, total }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode 2: Session-based calculation (existing logic)
    const { session_id, bonus_points = 0, bonus_reason = "" } = body;
    if (!session_id) throw new Error("session_id or (child_id + amount) is required");

    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sErr || !session) throw new Error("Session not found");

    const activeMinutes = Math.max(session.active_time_seconds / 60, 0);
    const totalTime = session.active_time_seconds + session.idle_time_seconds;
    const focusScore = totalTime > 0 ? session.active_time_seconds / totalTime : 1;

    const basePoints = Math.round(activeMinutes * focusScore);
    const totalPoints = basePoints + bonus_points;

    if (totalPoints > 0) {
      const reasons: string[] = [];
      if (basePoints > 0) reasons.push(`${basePoints} pts for ${Math.round(activeMinutes)} min study (${Math.round(focusScore * 100)}% focus)`);
      if (bonus_points > 0) reasons.push(`${bonus_points} pts bonus: ${bonus_reason || "activity"}`);

      const { error: pErr } = await supabase.from("points").insert({
        child_id: session.child_id,
        amount: totalPoints,
        reason: reasons.join(" + "),
      });

      if (pErr) throw pErr;
    }

    // End the session
    await supabase
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", session_id);

    return new Response(JSON.stringify({ points: totalPoints, basePoints, bonus_points, focusScore }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("calculate-points error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
