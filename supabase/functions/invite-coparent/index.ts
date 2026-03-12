import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, parent_id } = await req.json();
    if (!email || !parent_id) throw new Error("Email and parent_id are required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if already invited
    const { data: existing } = await supabase
      .from("co_parents")
      .select("id")
      .eq("primary_parent_id", parent_id)
      .eq("invited_email", email.toLowerCase())
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "This email has already been invited" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send invite via Supabase Auth
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);
    if (inviteError && !inviteError.message.includes("already been registered")) {
      throw inviteError;
    }

    // Store co-parent record
    const { error: insertError } = await supabase.from("co_parents").insert({
      primary_parent_id: parent_id,
      invited_email: email.toLowerCase(),
      status: "pending",
    });

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, message: `Invitation sent to ${email}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
