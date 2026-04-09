import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, child_id } = body;

    if (!action) return err("action is required");
    if (!child_id || typeof child_id !== "string") return err("child_id is required");

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(child_id)) return err("Invalid child_id format");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify child exists
    const { data: childExists } = await supabase
      .from("children")
      .select("id")
      .eq("id", child_id)
      .single();
    if (!childExists) return err("Child not found", 404);

    switch (action) {
      // ---- GET CHILD (from safe view) ----
      case "get_child": {
        const { data } = await supabase
          .from("children_safe")
          .select("*")
          .eq("id", child_id)
          .single();
        return json({ data });
      }

      // ---- DASHBOARD (useChildData) ----
      case "get_dashboard": {
        const [childRes, pointsRes, sessionsRes, claimsRes, loginsRes] = await Promise.all([
          supabase.from("children_safe").select("*").eq("id", child_id).single(),
          supabase.from("points").select("amount").eq("child_id", child_id),
          supabase.from("sessions").select("id, started_at").eq("child_id", child_id).order("started_at", { ascending: false }),
          supabase.from("reward_claims").select("id, reward_id, status, created_at").eq("child_id", child_id).order("created_at", { ascending: false }),
          supabase.from("daily_logins").select("login_date").eq("child_id", child_id).order("login_date", { ascending: false }).limit(60),
        ]);

        const child = childRes.data;
        let rewards: unknown[] = [];
        if (child?.parent_id) {
          const { data: rw } = await supabase
            .from("rewards")
            .select("id, name, description, point_cost")
            .eq("parent_id", child.parent_id)
            .eq("is_active", true)
            .order("point_cost", { ascending: true });
          rewards = rw || [];
        }

        return json({
          child,
          points: pointsRes.data || [],
          sessions: sessionsRes.data || [],
          claims: claimsRes.data || [],
          logins: loginsRes.data || [],
          rewards,
        });
      }

      // ---- CREATE SESSION ----
      case "create_session": {
        const { subject } = body;
        if (!subject || typeof subject !== "string") return err("subject is required");
        const { data, error: insertErr } = await supabase
          .from("sessions")
          .insert({ child_id, subject, status: "active" })
          .select("id")
          .single();
        if (insertErr) return err(insertErr.message, 500);
        return json({ data });
      }

      // ---- SAVE MESSAGE ----
      case "save_message": {
        const { session_id, role, content } = body;
        if (!session_id || !role || !content) return err("session_id, role, content required");
        // Verify session belongs to child
        const { data: sess } = await supabase.from("sessions").select("child_id").eq("id", session_id).single();
        if (!sess || sess.child_id !== child_id) return err("Session not found for this child", 403);
        const { error: msgErr } = await supabase.from("messages").insert({ session_id, role, content });
        if (msgErr) return err(msgErr.message, 500);
        return json({ ok: true });
      }

      // ---- ACHIEVEMENT ROOM ----
      case "get_achievement_room": {
        const [itemsRes, ownedRes, badgesRes, earnedRes] = await Promise.all([
          supabase.from("inventory_items").select("*").eq("is_active", true),
          supabase.from("child_inventory").select("*, inventory_items(*)").eq("child_id", child_id),
          supabase.from("badges").select("*").eq("is_active", true),
          supabase.from("child_badges").select("*, badges(*)").eq("child_id", child_id),
        ]);
        return json({
          items: itemsRes.data || [],
          owned: ownedRes.data || [],
          badges: badgesRes.data || [],
          earned: earnedRes.data || [],
        });
      }

      // ---- PURCHASE ITEM ----
      case "purchase_item": {
        const { item_id } = body;
        if (!item_id) return err("item_id required");
        // Get item cost
        const { data: item } = await supabase.from("inventory_items").select("xp_cost").eq("id", item_id).single();
        if (!item) return err("Item not found", 404);
        // Check points
        const { data: pts } = await supabase.from("points").select("amount").eq("child_id", child_id);
        const total = (pts || []).reduce((s: number, p: { amount: number }) => s + p.amount, 0);
        if (total < item.xp_cost) return err("Not enough XP");
        // Deduct + add inventory
        await supabase.from("points").insert({ child_id, amount: -item.xp_cost, reason: "Item purchase" });
        await supabase.from("child_inventory").insert({ child_id, item_id, is_equipped: false });
        return json({ ok: true });
      }

      // ---- TOGGLE EQUIP ----
      case "toggle_equip": {
        const { item_id: eqItemId, item_type } = body;
        if (!eqItemId || !item_type) return err("item_id and item_type required");
        // Get all owned of same type
        const { data: owned } = await supabase
          .from("child_inventory")
          .select("id, item_id, inventory_items!inner(item_type)")
          .eq("child_id", child_id);
        const sameType = (owned || []).filter((o: any) => o.inventory_items?.item_type === item_type);
        // Unequip all of same type
        for (const o of sameType) {
          await supabase.from("child_inventory").update({ is_equipped: false }).eq("id", o.id);
        }
        // Check if it was already equipped
        const wasEquipped = sameType.some((o: any) => o.item_id === eqItemId && false); // always equip since we unequipped all
        // Equip the target
        await supabase.from("child_inventory").update({ is_equipped: true }).eq("child_id", child_id).eq("item_id", eqItemId);
        return json({ ok: true });
      }

      // ---- MISSION PROGRESS ----
      case "get_mission_progress": {
        const { curriculum, grade } = body;
        if (!curriculum || !grade) return err("curriculum and grade required");
        const { data: activities } = await supabase
          .from("activities")
          .select("*")
          .eq("curriculum", curriculum)
          .eq("grade", grade)
          .eq("is_active", true)
          .order("sort_order");
        if (!activities?.length) return json({ activities: [], progress: [] });
        const { data: progress } = await supabase
          .from("child_activity_progress")
          .select("*")
          .eq("child_id", child_id)
          .in("activity_id", activities.map((a: any) => a.id));
        return json({ activities, progress: progress || [] });
      }

      // ---- COMPLETE ACTIVITY ----
      case "complete_activity": {
        const { activity_id, session_id: compSessionId, xp_reward, topic, next_activity_id } = body;
        if (!activity_id) return err("activity_id required");
        await supabase.from("child_activity_progress").upsert({
          child_id,
          activity_id,
          status: "completed",
          completed_at: new Date().toISOString(),
          session_id: compSessionId || null,
        }, { onConflict: "child_id,activity_id" });
        if (xp_reward) {
          await supabase.from("points").insert({
            child_id,
            amount: xp_reward,
            reason: `🏆 Completed mission: ${topic || activity_id}`,
          });
        }
        if (next_activity_id) {
          await supabase.from("child_activity_progress").upsert({
            child_id,
            activity_id: next_activity_id,
            status: "current",
          }, { onConflict: "child_id,activity_id" });
        }
        return json({ ok: true });
      }

      // ---- CLAIM REWARD ----
      case "claim_reward": {
        const { reward_id } = body;
        if (!reward_id) return err("reward_id required");
        const { error: claimErr } = await supabase.from("reward_claims").insert({
          child_id,
          reward_id,
          status: "pending",
        });
        if (claimErr) return err(claimErr.message, 500);
        return json({ ok: true });
      }

      // ---- UPDATE HOMEWORK ----
      case "update_homework": {
        const { homework_id, status } = body;
        if (!homework_id || !status) return err("homework_id and status required");
        // Verify homework belongs to child
        const { data: hw } = await supabase.from("homework").select("child_id").eq("id", homework_id).single();
        if (!hw || hw.child_id !== child_id) return err("Homework not found for this child", 403);
        await supabase.from("homework").update({ status }).eq("id", homework_id);
        return json({ ok: true });
      }

      // ---- SESSION HISTORY (for useSessionHistory) ----
      case "get_session_history": {
        const [childRes, sessRes, ptsRes, hwRes, rcRes] = await Promise.all([
          supabase.from("children_safe").select("name").eq("id", child_id).single(),
          supabase.from("sessions").select("*").eq("child_id", child_id).order("started_at", { ascending: false }),
          supabase.from("points").select("amount, reason, created_at").eq("child_id", child_id).order("created_at", { ascending: false }),
          supabase.from("homework").select("created_at, status, subject").eq("child_id", child_id).order("created_at", { ascending: false }),
          supabase.from("reward_claims").select("created_at, status, reward_id").eq("child_id", child_id).order("created_at", { ascending: false }),
        ]);
        // Get messages for sessions
        const sessionIds = (sessRes.data || []).map((s: any) => s.id);
        let messages: any[] = [];
        if (sessionIds.length > 0) {
          const { data: msgs } = await supabase
            .from("messages")
            .select("session_id, role")
            .in("session_id", sessionIds);
          messages = msgs || [];
        }
        return json({
          child_name: childRes.data?.name || "",
          sessions: sessRes.data || [],
          points: ptsRes.data || [],
          homework: hwRes.data || [],
          reward_claims: rcRes.data || [],
          messages,
        });
      }

      default:
        return err(`Unknown action: ${action}`);
    }
  } catch (e) {
    console.error("child-data error:", e);
    return err("Internal error", 500);
  }
});
