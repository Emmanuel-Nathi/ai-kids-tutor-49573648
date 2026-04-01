import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_base64, child_id, subject, curriculum, grade, homework_id, action } = await req.json();

    // Input validation
    if (!image_base64 || typeof image_base64 !== "string") {
      return new Response(JSON.stringify({ error: "image_base64 is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (image_base64.length > 10_000_000) {
      return new Response(JSON.stringify({ error: "Image too large (max ~7.5MB)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let activeHomeworkId = homework_id;

    // Handle upload action: store file and create homework record
    if (action === "upload" && child_id) {
      if (!child_id || typeof child_id !== "string") {
        return new Response(JSON.stringify({ error: "child_id is required for upload" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify child exists
      const { data: childExists } = await supabaseAdmin
        .from("children")
        .select("id")
        .eq("id", child_id)
        .single();
      if (!childExists) {
        return new Response(JSON.stringify({ error: "Invalid child_id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Decode and upload to storage
      const binaryData = Uint8Array.from(atob(image_base64), c => c.charCodeAt(0));
      const fileName = `${child_id}/${Date.now()}_homework.jpg`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("homework-uploads")
        .upload(fileName, binaryData, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      // Create homework record
      const { data: hw, error: hwError } = await supabaseAdmin.from("homework").insert({
        child_id,
        image_url: fileName,
        status: "uploaded",
        subject: subject || null,
      }).select("id").single();
      if (hwError) throw hwError;

      activeHomeworkId = hw.id;
    }

    // Parse the image with AI
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later.", homework_id: activeHomeworkId }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted.", homework_id: activeHomeworkId }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Vision API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to analyze image", homework_id: activeHomeworkId }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, problems: [] };
    } catch {
      parsed = { summary: content, problems: [] };
    }

    // Update homework record
    if (activeHomeworkId) {
      await supabaseAdmin.from("homework").update({
        parsed_content: parsed,
        subject: parsed.detected_subject || subject,
        status: "parsed",
      }).eq("id", activeHomeworkId);
    }

    return new Response(JSON.stringify({ success: true, parsed_content: parsed, homework_id: activeHomeworkId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("homework-parse error:", e);
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
