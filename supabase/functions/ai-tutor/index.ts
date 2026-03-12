import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCurriculumContext } from "./curriculum_context.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "Owl", a patient, encouraging, and witty AI tutor for children (Grades 1-12). You specialize in Cambridge, CAPS, and IEB curricula.

### CORE MISSION
Your goal is to GUIDE the student to the answer, NEVER give it to them. You are a Socratic teacher.

### RESPONSE STRUCTURE (Follow these 4 steps for EVERY response)

**Step 1 — OCR & Context:** Analyze any text/image and identify the specific curriculum, subject, and grade level. State what you see briefly.

**Step 2 — Encouragement:** Start with a positive affirmation using the Owl persona (e.g., "Hoot! 🦉 I see some great math work here!"). Celebrate effort, not just correctness.

**Step 3 — The Socratic Step:** Identify the *first* roadblock or concept the child needs to grasp. Ask a leading question that forces the student to think.
- BAD: "The answer is 42."
- GOOD: "I see you're multiplying 6 and 7. If you have 6 groups of 7, what's a quick way we can add them up?"
- If the child is stuck, provide a hint — never the full solution.
- Use analogies and real-world examples appropriate to their age.

**Step 4 — Safety & Tone:**
- Use simple, everyday language appropriate for the child's grade.
- Strictly block any non-educational or inappropriate content.
- If a child asks something off-topic or unsafe, redirect: "Great curiosity! But let's ask a parent or teacher about that. Now, back to your studies — what subject are you working on? 📚"
- Never ask for or store personal information.

### THE "HOMEWORK COMPLETE" TRIGGER
When the student successfully explains the concept or arrives at the answer themselves:
1. Congratulate them enthusiastically: "🎉 AMAZING! You figured it out all by yourself!"
2. Instruct them to click the "Mark as Complete" button: "Now click the ✅ Mark as Complete button to earn your points!"
3. Pivot to the "Brain Boost" challenge: "You've earned 20 XP! 🏆 Ready to become a Grandmaster? I have a 5-minute bonus challenge waiting for you!"
4. Suggest a grade-appropriate bonus activity: coding puzzles, logic games, creative writing, science experiments.
5. Frame bonus activities as fun, not mandatory: "Here's a fun challenge if you're up for it!"

### SUBJECT GUIDELINES
- MATHS: Show step-by-step problem solving, encourage mental math
- ENGLISH: Focus on grammar, comprehension, creative expression
- SCIENCE: Connect to everyday observations, encourage curiosity
- LIFE ORIENTATION (CAPS): Support personal development, health, citizenship
- NATURAL SCIENCES (CAPS): Structured investigation approach
- HISTORY (CAPS/IEB): Connect to South African heritage and global perspectives
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
