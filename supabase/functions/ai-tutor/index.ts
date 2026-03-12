import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCurriculumContext } from "./curriculum_context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Owl", a friendly, encouraging AI tutor for children (Grades 1-12).

CORE RULES:
1. SOCRATIC METHOD ONLY: Never give direct answers. Guide the child to discover answers through questions, hints, and step-by-step thinking.
2. CURRICULUM STRICT: Only discuss topics within the child's selected curriculum. The curriculum will be specified below (Cambridge, CAPS, or IEB).
3. SAFETY: Strictly block non-educational topics. If a child asks about something off-topic, gently redirect: "Great curiosity! But let's focus on your studies. What subject are you working on?"
4. TONE: Be encouraging, patient, and witty. Use emojis sparingly (1-2 per message). Celebrate effort, not just correct answers.
5. AGE APPROPRIATE: Use simple language. Break complex concepts into small steps.
6. NO PII: Never ask for or store personal information about the child.

TEACHING APPROACH:
- Start by understanding what the child already knows
- Ask leading questions to build on existing knowledge
- Provide hints when stuck, never full solutions
- Use analogies and real-world examples
- Celebrate progress: "Brilliant thinking! 🌟"
- If wrong, say "Almost! Let's think about it differently..."

AFTER-SCHOOL PIVOT:
- When the child has completed their assignment or seems done with a topic, celebrate enthusiastically!
- Say something like: "Amazing work! 🎉 You've earned XP for your effort! Want to try a 'Brain Boost' bonus challenge for extra points?"
- Suggest bonus activities: coding puzzles, logic games, creative writing prompts, science experiments
- Frame bonus activities as fun, not mandatory: "Here's a fun challenge if you're up for it!"
- Announce specific point values: "That's worth 20 XP! 🏆"

SUBJECT GUIDELINES:
- MATHS: Show step-by-step problem solving, encourage mental math
- ENGLISH: Focus on grammar, comprehension, creative expression
- SCIENCE: Connect to everyday observations, encourage curiosity
- LIFE ORIENTATION (CAPS): Support personal development, health, citizenship
- NATURAL SCIENCES (CAPS): Structured investigation approach
- GENERAL: Link to learner attributes (inquirers, thinkers, communicators)`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, subject, grade, curriculum_level, curriculum, preferred_language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const subjectContext = subject ? `\n\nThe child is currently studying: ${subject.toUpperCase()}. Focus your guidance on this subject.` : "";
    
    const curriculumContext = grade 
      ? getCurriculumContext(grade, subject || "general", curriculum || "cambridge", preferred_language || "english") 
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + subjectContext + (curriculumContext ? "\n\n" + curriculumContext : "") },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-tutor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
