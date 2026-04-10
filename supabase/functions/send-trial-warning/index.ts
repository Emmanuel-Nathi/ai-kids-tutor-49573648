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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find trial users whose trial expires in 5 days (created 25 days ago)
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .eq("subscription_status", "trial")
      .lte("created_at", new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString())
      .gte("created_at", new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    let sent = 0;

    for (const profile of profiles || []) {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
      if (!user?.email) continue;

      const daysLeft = 5;
      const safeName = escapeHtml(profile.display_name || "there");
      const emailHtml = `
        <div style="font-family: 'Fredoka', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${LOGO_URL}" alt="AI Kids Tutor" width="64" height="64" style="border-radius: 16px;" />
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: hsl(24, 95%, 53%); font-size: 28px; margin: 0;">Your Trial Ends in ${daysLeft} Days! ⏰</h1>
          </div>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi ${safeName},
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your free trial of AI Kids Tutor is ending soon. Don't let your child lose their learning momentum!
          </p>
          <div style="background: hsl(45, 93%, 58%, 0.15); border-radius: 16px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 18px; font-weight: bold; color: #333;">Full Access — R199.99/month</p>
            <p style="margin: 0; color: #666; font-size: 14px;">Unlimited AI tutoring • All curricula • Parent analytics</p>
          </div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://ai-kids-tutor.lovable.app/auth" 
               style="background: hsl(24, 95%, 53%); color: white; padding: 14px 32px; border-radius: 16px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Keep Learning — Subscribe Now
            </a>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">
            Questions? Just reply to this email. We're here to help! 🦉
          </p>
        </div>
      `;

      const messageId = crypto.randomUUID();

      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: "trial_warning",
        recipient_email: user.email,
        status: "pending",
      });

      const { error: enqueueError } = await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: {
          message_id: messageId,
          to: user.email,
          from: 'AI Kids Tutor <noreply@www.aikidstutor.co.za>',
          sender_domain: 'notify.www.aikidstutor.co.za',
          subject: `Your AI Kids Tutor trial ends in ${daysLeft} days ⏰`,
          html: emailHtml,
          purpose: 'transactional',
          label: 'trial_warning',
          queued_at: new Date().toISOString(),
        },
      });

      if (!enqueueError) sent++;
      else console.error(`Failed to enqueue for ${user.email}:`, enqueueError);
    }

    return new Response(JSON.stringify({ sent, total: profiles?.length || 0 }), {
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
