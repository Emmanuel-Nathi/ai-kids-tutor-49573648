import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Payfast sandbox IPs — replace/extend with production IPs before go-live
const PAYFAST_ALLOWED_IPS = [
  "197.97.145.144",
  // Production IPs (add before go-live):
  // "41.74.179.194", "41.74.179.195", "41.74.179.196", "41.74.179.197",
  // "41.74.179.198", "41.74.179.199", "41.74.179.200", "41.74.179.201",
  // "41.74.179.202", "41.74.179.203", "41.74.179.204", "41.74.179.205",
  // "41.74.179.206", "41.74.179.207", "41.74.179.208", "41.74.179.209",
  // "41.74.179.210", "41.74.179.211", "41.74.179.212", "41.74.179.213",
  // "41.74.179.214", "41.74.179.215", "41.74.179.216", "41.74.179.217",
  // "41.74.179.218", "41.74.179.219", "41.74.179.220",
];

async function md5(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("MD5", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function verifySignature(
  params: Record<string, string>,
  receivedSignature: string,
  passphrase: string | null
): Promise<boolean> {
  // Sort params alphabetically, exclude 'signature'
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "signature")
    .sort();

  const paramString = sortedKeys
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  const stringToHash = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : paramString;

  return md5(stringToHash).then((hash) => hash === receivedSignature);
}

async function validateWithPayfast(
  params: Record<string, string>,
  sandbox: boolean
): Promise<boolean> {
  const validateUrl = sandbox
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

  try {
    const body = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
      .join("&");

    const response = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const text = await response.text();
    return text.trim() === "VALID";
  } catch (err) {
    console.error("Payfast server validation failed:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. IP check (best-effort — edge proxies may strip real IP)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim();
    if (clientIp && !PAYFAST_ALLOWED_IPS.includes(clientIp)) {
      console.warn(`[payfast-webhook] Rejected request from IP: ${clientIp}`);
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value as string;
    });

    const paymentStatus = params["payment_status"];
    const mPaymentId = params["m_payment_id"]; // parent user_id
    const receivedSignature = params["signature"];

    if (!mPaymentId) {
      console.error("[payfast-webhook] Missing m_payment_id");
      return new Response("Missing m_payment_id", { status: 400, headers: corsHeaders });
    }

    // 3. Signature verification
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") || null;
    if (receivedSignature) {
      const sigValid = await verifySignature(params, receivedSignature, passphrase);
      if (!sigValid) {
        console.error("[payfast-webhook] Signature mismatch — rejecting.");
        return new Response("Invalid signature", { status: 403, headers: corsHeaders });
      }
      console.log("[payfast-webhook] Signature verified ✓");
    } else {
      console.warn("[payfast-webhook] No signature in request — proceeding with caution.");
    }

    // 4. Server validation with Payfast
    // TODO: Set to false for production
    const isSandbox = true;
    const serverValid = await validateWithPayfast(params, isSandbox);
    if (!serverValid) {
      console.error("[payfast-webhook] Payfast server validation failed — rejecting.");
      return new Response("Server validation failed", { status: 403, headers: corsHeaders });
    }
    console.log("[payfast-webhook] Server validation passed ✓");

    // 5. Process payment
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (paymentStatus === "COMPLETE") {
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("user_id", mPaymentId);

      if (error) {
        console.error("[payfast-webhook] DB update error:", error);
        return new Response("DB error", { status: 500, headers: corsHeaders });
      }
      console.log(`[payfast-webhook] Activated subscription for user ${mPaymentId}`);
    } else if (paymentStatus === "CANCELLED") {
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "cancelled" })
        .eq("user_id", mPaymentId);

      if (error) {
        console.error("[payfast-webhook] DB update error:", error);
      }
      console.log(`[payfast-webhook] Cancelled subscription for user ${mPaymentId}`);
    } else {
      console.log(`[payfast-webhook] Received status: ${paymentStatus} for user ${mPaymentId} — no action.`);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("[payfast-webhook] Error:", error);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
