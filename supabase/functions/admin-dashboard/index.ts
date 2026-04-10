import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Whitelist of allowed fields for activity updates
const ALLOWED_ACTIVITY_FIELDS = new Set([
  "topic", "grade", "curriculum", "subject", "objectives",
  "difficulty", "xp_reward", "sort_order", "is_active",
]);

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

    if (!action || typeof action !== "string") {
      return new Response(JSON.stringify({ error: "action is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      if (!profileId || typeof profileId !== "string" || !["active", "cancelled", "trial"].includes(status)) {
        return new Response(JSON.stringify({ error: "Invalid params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(profileId)) {
        return new Response(JSON.stringify({ error: "Invalid profileId format" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // ─── Activity Management ───
    if (action === "manage-activities") {
      const { operation } = params;

      if (operation === "list") {
        const { data, error } = await adminClient
          .from("activities")
          .select("*")
          .order("curriculum")
          .order("grade")
          .order("sort_order");
        if (error) throw error;
        return new Response(JSON.stringify({ activities: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (operation === "create") {
        const { topic, grade, curriculum, subject, objectives, difficulty, xp_reward, sort_order } = params;
        if (!topic || typeof topic !== "string" || topic.length > 500) {
          return new Response(JSON.stringify({ error: "Valid topic is required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!grade || typeof grade !== "string" || grade.length > 20) {
          return new Response(JSON.stringify({ error: "Valid grade is required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await adminClient.from("activities").insert({
          topic: topic.slice(0, 500),
          grade,
          curriculum: (curriculum || "cambridge").slice(0, 50),
          subject: (subject || "general").slice(0, 50),
          objectives: Array.isArray(objectives) ? objectives.slice(0, 20) : [],
          difficulty: Math.min(Math.max(Number(difficulty) || 1, 1), 10),
          xp_reward: Math.min(Math.max(Number(xp_reward) || 30, 0), 1000),
          sort_order: Number(sort_order) || 0,
          created_by: user.id,
        }).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ activity: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (operation === "update") {
        const { activityId, updates } = params;
        if (!activityId || typeof activityId !== "string") {
          return new Response(JSON.stringify({ error: "activityId required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_RE.test(activityId)) {
          return new Response(JSON.stringify({ error: "Invalid activityId format" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Sanitize updates: only allow whitelisted fields
        if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
          return new Response(JSON.stringify({ error: "updates object required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
          if (ALLOWED_ACTIVITY_FIELDS.has(key)) {
            sanitized[key] = value;
          }
        }
        if (Object.keys(sanitized).length === 0) {
          return new Response(JSON.stringify({ error: "No valid fields to update" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await adminClient.from("activities")
          .update(sanitized).eq("id", activityId).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ activity: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (operation === "delete") {
        const { activityId } = params;
        if (!activityId || typeof activityId !== "string") {
          return new Response(JSON.stringify({ error: "activityId required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID_RE.test(activityId)) {
          return new Response(JSON.stringify({ error: "Invalid activityId format" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { error } = await adminClient.from("activities").delete().eq("id", activityId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown operation" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "preview-activity") {
      const { topic, grade, curriculum, objectives } = params;
      if (!topic || typeof topic !== "string" || topic.length > 500) {
        return new Response(JSON.stringify({ error: "Valid topic required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

      const curriculumStyle: Record<string, string> = {
        caps: "Follow the SA CAPS structure. Be systematic. Use South African examples.",
        ieb: "Prioritize critical thinking. Ask 'Why' and 'How' questions. Challenge assumptions.",
        cambridge: "Use a spiral learning approach. Reference prior foundational concepts.",
      };

      const safeObjectives = Array.isArray(objectives) ? objectives.slice(0, 20) : [];
      const objectivesList = safeObjectives.map((o: string, i: number) => `${i + 1}. ${String(o).slice(0, 500)}`).join("\n");

      const previewPrompt = `Generate a sample 3-turn Socratic tutoring conversation between "Owl" (AI tutor) and a Grade ${String(grade || "unknown").slice(0, 20)} student about "${topic.slice(0, 500)}".

Curriculum: ${(String(curriculum || "cambridge").slice(0, 50)).toUpperCase()}
Style: ${curriculumStyle[curriculum?.toLowerCase()] || "Standard Socratic guidance."}
${objectivesList ? `Learning Objectives:\n${objectivesList}` : ""}

Format as:
🦉 Owl: [opening message]
👦 Student: [typical student response]
🦉 Owl: [Socratic follow-up guiding toward understanding]
👦 Student: [student attempting the answer]
🦉 Owl: [encouraging conclusion with celebration]

Keep it age-appropriate for Grade ${String(grade || "unknown").slice(0, 20)}. Be encouraging and use emojis.`;

      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: previewPrompt }],
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        console.error("Preview generation error:", resp.status, t);
        return new Response(JSON.stringify({ error: "Failed to generate preview" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await resp.json();
      const preview = result.choices?.[0]?.message?.content || "Preview generation failed.";

      return new Response(JSON.stringify({ preview }), {
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
