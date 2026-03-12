import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_base64, child_id, subject, curriculum, grade, homework_id } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const curriculumLabel = curriculum === "caps" ? "CAPS (South African)" : curriculum === "ieb" ? "IEB (South African)" : "Cambridge International";

    const systemPrompt = `You are an expert homework scanner for a ${curriculumLabel} curriculum student in Grade ${grade || "unknown"}.

Analyze the uploaded homework image and:
1. Extract all text and mathematical expressions visible
2. Identify individual problems/questions
3. Classify the subject area
4. For each problem, determine if an answer has been written and if it appears correct

Return a JSON object with this structure:
{
  "detected_subject": "math|english|science|general",
  "problems": [
    {
      "number": 1,
      "question": "the question text",
      "student_answer": "what the student wrote (or null if blank)",
      "appears_correct": true|false|null,
      "hint": "a brief Socratic hint to guide the student"
    }
  ],
  "summary": "Brief description of the worksheet"
}

Be accurate with OCR. If handwriting is unclear, note it. Focus on ${subject || "general"} content.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this homework image and extract the problems." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Vision API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, problems: [] };
    } catch {
      parsed = { summary: content, problems: [] };
    }

    // Update homework record if homework_id provided
    if (homework_id) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabaseAdmin.from("homework").update({
        parsed_content: parsed,
        subject: parsed.detected_subject || subject,
        status: "parsed",
      }).eq("id", homework_id);
    }

    return new Response(JSON.stringify({ success: true, parsed_content: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("homework-parse error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
