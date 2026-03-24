import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    if (action === "get-stats") {
      const [profilesRes, pointsRes, activeRes, trialRes, cancelledRes, childrenRes, sessionsRes] = await Promise.all([
        adminClient.from("profiles").select("id", { count: "exact", head: true }),
        adminClient.from("points").select("amount"),
        adminClient.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "active"),
        adminClient.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "trial"),
        adminClient.from("profiles").select("id", { count: "exact", head: true }).eq("subscription_status", "cancelled"),
        adminClient.from("children").select("id", { count: "exact", head: true }),
        adminClient.from("sessions").select("id", { count: "exact", head: true })
          .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const totalXP = (pointsRes.data || []).reduce((sum: number, p: any) => sum + p.amount, 0);

      return new Response(
        JSON.stringify({
          totalUsers: profilesRes.count || 0,
          activeSubscriptions: activeRes.count || 0,
          trialUsers: trialRes.count || 0,
          cancelledUsers: cancelledRes.count || 0,
          totalChildren: childrenRes.count || 0,
          sessionsLast7Days: sessionsRes.count || 0,
          totalXP,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list-subscribers") {
      const { data, error } = await adminClient
        .from("profiles")
        .select("id, user_id, display_name, subscription_status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(JSON.stringify({ subscribers: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list-recent-activity") {
      const { data, error } = await adminClient
        .from("sessions")
        .select("id, child_id, subject, status, started_at, ended_at, active_time_seconds")
        .order("started_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get child names
      const childIds = [...new Set((data || []).map((s: any) => s.child_id))];
      const { data: children } = await adminClient
        .from("children")
        .select("id, name")
        .in("id", childIds);

      const childMap = Object.fromEntries((children || []).map((c: any) => [c.id, c.name]));

      const sessions = (data || []).map((s: any) => ({
        ...s,
        child_name: childMap[s.child_id] || "Unknown",
      }));

      return new Response(JSON.stringify({ sessions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update-subscription") {
      const { profileId, status } = params;
      if (!profileId || !["active", "cancelled", "trial"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await adminClient
        .from("profiles")
        .update({ subscription_status: status })
        .eq("id", profileId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
