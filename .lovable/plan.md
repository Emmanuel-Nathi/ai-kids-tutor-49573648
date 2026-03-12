

# Plan: Multi-Curriculum Support, Enhanced Parent Dashboard, Homework Scanner

## Overview

Expand AI Kids Tutor from Cambridge-only to support **Cambridge, CAPS, and IEB** curricula. Add a homework scanner with AI vision, enhanced parent dashboard, and replace the owl logo with the uploaded image.

---

## 1. Replace Owl Logo

Copy `user-uploads://IMG-20250702-WA0039-2.jpg` to `src/assets/logo.png` (overwrite existing). The uploaded image has a black background — it will need to be used as-is since we can't process transparency in-browser, but it works well on dark backgrounds. We'll add a CSS `mix-blend-mode` or contain it in a rounded container where needed.

---

## 2. Database Migration

**Update `children` table:**
- Add `selected_curriculum text NOT NULL DEFAULT 'cambridge'` — values: `cambridge`, `caps`, `ieb`
- Add `preferred_language text DEFAULT 'english'` — values: `english`, `afrikaans`, `isizulu`

**Update `sessions` table:**
- Add `interaction_summary text` — AI-generated session summary
- Add `curriculum_alignment_score integer` — 0-100 score

---

## 3. Multi-Curriculum AI Brain

**Rewrite `curriculum_context.ts`:**
- Restructure to accept `curriculum` parameter alongside `grade` and `subject`
- Add CAPS curriculum map: Foundation Phase (1-3), Intermediate (4-6), Senior (7-9), FET (10-12) with SA-specific subjects like "Life Orientation", "Natural Sciences & Technology"
- Add IEB curriculum map: Same phase structure but with emphasis on analytical/higher-order thinking, project-based inquiry
- Keep existing Cambridge map
- Add language support function that appends Afrikaans/isiZulu key term translations when `preferred_language` is set

**Update `ai-tutor/index.ts` system prompt:**
- Accept `curriculum` from request body
- Cambridge: "Key Stages" terminology, problem-solving focus
- CAPS: "Phases" terminology, structured sequential learning, SA-specific subjects
- IEB: "Phases" terminology, critical thinking, analytical exam prep
- Add language translation instruction when non-English language is selected

---

## 4. Homework Scanner with AI Vision

**New edge function: `supabase/functions/homework-parse/index.ts`**
- Accepts base64 image + `child_id`, `subject`, `curriculum`
- Sends to Lovable AI Gateway using `google/gemini-2.5-pro` (supports vision)
- System prompt instructs: identify problems in the image, extract text/math, return structured JSON with detected problems
- Curriculum-aware: uses grade + curriculum to frame the parsing
- Saves parsed content to `homework` table

**Update `src/pages/ChildHomework.tsx`:**
- Real file upload (camera/gallery) → upload to `homework-uploads` storage bucket
- Send image to `homework-parse` edge function
- Display parsed problems with option to get AI help on each one (links to chat)
- Show upload progress and parsing status

**Update `supabase/config.toml`:** Add `[functions.homework-parse]` with `verify_jwt = false`

---

## 5. Enhanced Parent Dashboard

**Update `src/pages/ParentChildDetail.tsx`:**
- Add `interaction_summary` display per session (from DB)
- Add `curriculum_alignment_score` visual indicator per session
- Improve the curriculum mastery heatmap to show curriculum-specific module mastery (e.g., CAPS "Life Orientation" vs Cambridge "Global Perspectives")

**Update `src/pages/ParentDashboard.tsx`:**
- When adding a child, include curriculum selector (Cambridge/CAPS/IEB) and language preference
- Display curriculum badge on each child card

---

## 6. UI Updates

**Update `src/pages/ChildHome.tsx`:**
- Add CAPS-specific subjects when curriculum is CAPS (e.g., "Life Orientation", "Natural Sciences & Tech")
- Show curriculum badge in header

**Update `src/pages/Landing.tsx`:**
- Change "Cambridge Aligned" feature to "Multi-Curriculum" with desc "Cambridge, CAPS & IEB support"

**Update `src/pages/Auth.tsx`:** No changes needed.

---

## 7. After-School XP Pivot

Update the AI tutor system prompt to explicitly announce XP earned when homework is marked complete, and prompt for "Brain Boost" bonus challenges. This is already partially implemented in the prompt — we'll strengthen the language and tie it to the point values.

---

## Build Order

1. Copy new logo, DB migration (curriculum + language columns, session summary columns)
2. Rewrite `curriculum_context.ts` with CAPS + IEB maps
3. Update `ai-tutor/index.ts` for multi-curriculum + language support
4. Create `homework-parse` edge function with vision AI
5. Update `ChildHomework.tsx` with real upload + parsing UI
6. Update `ParentDashboard.tsx` with curriculum selector in add-child flow
7. Update `ChildHome.tsx` with curriculum-aware subjects
8. Update `ParentChildDetail.tsx` with summary + alignment score
9. Update `Landing.tsx` feature list
10. Deploy edge functions

