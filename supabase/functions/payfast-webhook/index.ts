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
    const formData = await req.formData();
    const paymentStatus = formData.get("payment_status") as string;
    const mPaymentId = formData.get("m_payment_id") as string; // parent user_id

    if (!mPaymentId) {
      return new Response("Missing m_payment_id", { status: 400, headers: corsHeaders });
    }

    if (paymentStatus === "COMPLETE") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("user_id", mPaymentId);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Payfast webhook error:", error);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
