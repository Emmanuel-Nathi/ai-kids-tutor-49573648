import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://ai-kids-tutor.lovable.app/email-logo.png";

const CURRICULUM_LABELS: Record<string, string> = {
  caps: "CAPS (Public Schools SA)",
  ieb: "IEB (Private Schools SA)",
  cambridge: "Cambridge (International)",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the calling user
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { child_name, grade, curriculum } = await req.json();

    if (!child_name || !grade || !curriculum) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const curriculumLabel = CURRICULUM_LABELS[curriculum] || curriculum;

    const emailHtml = `
      <div style="font-family: 'Fredoka', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${LOGO_URL}" alt="AI Kids Tutor" width="64" height="64" style="border-radius: 16px;" />
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: hsl(24, 95%, 53%); font-size: 28px; margin: 0;">${child_name}'s Profile is Ready! 🎉</h1>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Great news! You've successfully added <strong>${child_name}</strong> to AI Kids Tutor.
        </p>
        <div style="background: hsl(24, 95%, 53%, 0.1); border-radius: 16px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px; font-weight: bold; color: hsl(24, 95%, 53%);">📋 Profile Details:</p>
          <ul style="color: #333; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li><strong>Name:</strong> ${child_name}</li>
            <li><strong>Grade:</strong> ${grade}</li>
            <li><strong>Curriculum:</strong> ${curriculumLabel}</li>
          </ul>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          ${child_name} can now start learning with Owl! Log in and let them try their first tutoring session.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://ai-kids-tutor.lovable.app/parent" 
             style="background: hsl(24, 95%, 53%); color: white; padding: 14px 32px; border-radius: 16px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">
          Questions? Just reply to this email — we'd love to help! 🦉
        </p>
      </div>
    `;

    const messageId = crypto.randomUUID();

    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: "child_added",
      recipient_email: user.email,
      status: "pending",
    });

    const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: user.email,
        from: "AI Kids Tutor <noreply@www.aikidstutor.co.za>",
        sender_domain: "notify.www.aikidstutor.co.za",
        subject: `${child_name}'s profile is ready! 🎉`,
        html: emailHtml,
        purpose: "transactional",
        label: "child_added",
        queued_at: new Date().toISOString(),
      },
    });

    if (enqueueError) {
      console.error("Enqueue failed:", enqueueError);
      return new Response(JSON.stringify({ error: "Failed to enqueue email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
