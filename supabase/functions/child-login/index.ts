import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STREAK_MILESTONES = [
  { days: 30, bonus: 100, reason: "streak_bonus_30" },
  { days: 14, bonus: 50, reason: "streak_bonus_14" },
  { days: 7, bonus: 25, reason: "streak_bonus_7" },
  { days: 3, bonus: 10, reason: "streak_bonus_3" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, pin } = await req.json();
    if (!pin || !pin.trim()) throw new Error("PIN is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Use the secure verify_child_pin RPC which compares against hashed PINs
    const { data: matches, error: rpcError } = await supabase.rpc("verify_child_pin", {
      p_pin: pin.trim(),
      p_name: name && name.trim() ? name.trim() : null,
    });

    if (rpcError) throw rpcError;

    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ error: "No child found with that PIN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const child = matches[0];
    const childId = child.found_child_id;
    const childName = child.found_child_name;

    // Record daily login (ON CONFLICT DO NOTHING)
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("daily_logins").upsert(
      { child_id: childId, login_date: today },
      { onConflict: "child_id,login_date", ignoreDuplicates: true }
    );

    // Calculate streak
    const { data: logins } = await supabase
      .from("daily_logins")
      .select("login_date")
      .eq("child_id", childId)
      .order("login_date", { ascending: false })
      .limit(60);

    let streak = 0;
    if (logins && logins.length > 0) {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < logins.length; i++) {
        const expected = new Date(todayDate);
        expected.setDate(todayDate.getDate() - i);
        const loginDate = new Date(logins[i].login_date + "T00:00:00");
        if (loginDate.getTime() === expected.getTime()) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Award streak bonuses
    let streakBonus = 0;
    for (const milestone of STREAK_MILESTONES) {
      if (streak >= milestone.days) {
        const { data: existing } = await supabase
          .from("points")
          .select("id")
          .eq("child_id", childId)
          .eq("reason", milestone.reason)
          .gte("created_at", new Date(new Date().setDate(new Date().getDate() - milestone.days)).toISOString())
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from("points").insert({
            child_id: childId,
            amount: milestone.bonus,
            reason: milestone.reason,
          });
          streakBonus = milestone.bonus;
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ child_id: childId, name: childName, streak, streak_bonus: streakBonus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Login failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
