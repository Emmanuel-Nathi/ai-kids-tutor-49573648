import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, display_name } = await req.json();

    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "Missing user_id or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already sent
    const { data: profile } = await supabase
      .from("profiles")
      .select("welcome_email_sent")
      .eq("user_id", user_id)
      .single();

    if (profile?.welcome_email_sent) {
      return new Response(JSON.stringify({ message: "Already sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <div style="font-family: 'Fredoka', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: hsl(24, 95%, 53%); font-size: 28px; margin: 0;">Welcome to AI Kids Tutor! 🦉</h1>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi ${display_name || "there"},
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

    // Enqueue via the email queue for reliable delivery
    const { error: enqueueError } = await supabase.rpc('enqueue_email', {
      p_queue_name: 'transactional_emails',
      p_to_email: email,
      p_subject: 'Welcome to AI Kids Tutor! 🦉',
      p_html: emailHtml,
      p_template_name: 'welcome',
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
