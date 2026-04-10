import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOGO_URL = "https://ai-kids-tutor.lovable.app/email-logo.png";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require auth - only authenticated users or service role should trigger welcome emails
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the calling user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Only allow sending welcome email for the calling user themselves
    const user_id = user.id;
    const email = user.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "No email found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get display name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("welcome_email_sent, display_name")
      .eq("user_id", user_id)
      .single();

    if (profile?.welcome_email_sent) {
      return new Response(JSON.stringify({ message: "Already sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeName = escapeHtml(profile?.display_name || "there");

    const emailHtml = `
      <div style="font-family: 'Fredoka', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${LOGO_URL}" alt="AI Kids Tutor" width="64" height="64" style="border-radius: 16px;" />
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: hsl(24, 95%, 53%); font-size: 28px; margin: 0;">Welcome to AI Kids Tutor! 🦉</h1>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi ${safeName},
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We're thrilled to have you on board! Your 30-day free trial has started — here's how to get the most out of it:
        </p>
        <div style="background: hsl(24, 95%, 53%, 0.1); border-radius: 16px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px; font-weight: bold; color: hsl(24, 95%, 53%);">🚀 Getting Started:</p>
          <ol style="color: #333; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            <li><strong>Add your child's profile</strong> — Set their grade, curriculum (CAPS, IEB, or Cambridge), and a fun access PIN</li>
            <li><strong>Let them chat with Owl</strong> — Our AI tutor uses the Socratic method to build real understanding</li>
            <li><strong>Scan homework</strong> — Take a photo and get instant, step-by-step guidance</li>
            <li><strong>Set up rewards</strong> — Motivate learning with points they can redeem for real treats!</li>
          </ol>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://ai-kids-tutor.lovable.app/auth" 
             style="background: hsl(24, 95%, 53%); color: white; padding: 14px 32px; border-radius: 16px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Open AI Kids Tutor
          </a>
        </div>
        <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">
          Questions? Just reply to this email — we'd love to help! 🦉
        </p>
      </div>
    `;

    const messageId = crypto.randomUUID();

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: "welcome",
      recipient_email: email,
      status: "pending",
    });

    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        message_id: messageId,
        to: email,
        from: 'AI Kids Tutor <noreply@www.aikidstutor.co.za>',
        sender_domain: 'notify.www.aikidstutor.co.za',
        subject: 'Welcome to AI Kids Tutor! 🦉',
        html: emailHtml,
        purpose: 'transactional',
        label: 'welcome',
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

    // Mark as sent
    await supabase
      .from("profiles")
      .update({ welcome_email_sent: true })
      .eq("user_id", user_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
