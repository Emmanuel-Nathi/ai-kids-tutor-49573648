

# Activity Builder + Mission Map Implementation

## Overview
Build a database-driven "Activity Blueprints" system with a curriculum-aware prompt engine, an admin Activity Creator with AI preview, and a child-facing Mission Map with a winding level path.

---

## 1. Database: `activities` Table (Migration)

Create the `activities` table to store curriculum-specific learning blueprints:

```sql
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  grade text NOT NULL,
  curriculum text NOT NULL DEFAULT 'cambridge',
  subject text NOT NULL DEFAULT 'general',
  objectives jsonb NOT NULL DEFAULT '[]',
  difficulty integer NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  xp_reward integer NOT NULL DEFAULT 30,
  created_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Admin full access via service role
CREATE POLICY "Service role full access" ON public.activities FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Authenticated parents can read active activities
CREATE POLICY "Authenticated can read active" ON public.activities FOR SELECT
  TO authenticated USING (is_active = true);

-- Anon can read active (for child PIN-login sessions)
CREATE POLICY "Anon can read active" ON public.activities FOR SELECT
  TO anon USING (is_active = true);
```

Also create a `child_activity_progress` table to track completion:

```sql
CREATE TABLE public.child_activity_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'locked', -- locked, current, completed
  completed_at timestamptz,
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, activity_id)
);

ALTER TABLE public.child_activity_progress ENABLE ROW LEVEL SECURITY;

-- Parents can view/manage their children's progress
CREATE POLICY "Parents can view" ON public.child_activity_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activity_progress.child_id AND children.parent_id = auth.uid()));

CREATE POLICY "Parents can insert" ON public.child_activity_progress FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_activity_progress.child_id AND children.parent_id = auth.uid()));

CREATE POLICY "Parents can update" ON public.child_activity_progress FOR UPDATE
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activity_progress.child_id AND children.parent_id = auth.uid()));

-- Anon access for child PIN sessions
CREATE POLICY "Anon can view" ON public.child_activity_progress FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert" ON public.child_activity_progress FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update" ON public.child_activity_progress FOR UPDATE TO anon USING (true);

-- Service role full access
CREATE POLICY "Service role full" ON public.child_activity_progress FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
```

---

## 2. Curriculum-Aware Prompt Engine (Edge Function Update)

**File: `supabase/functions/ai-tutor/index.ts`**

Add a `getCurriculumInstruction()` helper that injects curriculum-specific pedagogy into the system prompt when an activity's objectives are provided:

- **CAPS**: "Follow the SA CAPS structure. Focus on systematic building blocks. Use local SA examples."
- **IEB**: "Prioritize critical thinking and application. Ask high-order 'Why' and 'How' questions. Challenge assumptions."
- **Cambridge**: "Use a spiral learning approach. Connect the current topic to foundational concepts from previous years."

When the request includes `activity_objectives` (JSONB from the activities table), append them to the system prompt so Gemini focuses on those specific learning goals.

---

## 3. Admin Activity Creator (New Component + Edge Function)

### Edge Function: `admin-dashboard/index.ts`
Add two new actions:

- **`manage-activities`**: CRUD for activities (list, create, update, delete) — admin only
- **`preview-activity`**: Calls Gemini to generate a sample 3-turn Socratic conversation based on the activity's topic, grade, curriculum, and objectives

### New Component: `src/components/admin/ActivityCreator.tsx`
A form with:
- Topic (text input)
- Grade (select 1-12)
- Curriculum (select CAPS / IEB / Cambridge)
- Subject (select from subjects list)
- Difficulty (1-5 slider)
- XP Reward (number input)
- Learning Objectives (dynamic list — add/remove objective text fields)
- **"Generate Preview"** button — calls the edge function to show a sample 3-turn Socratic conversation in a chat-bubble preview
- **"Save Activity"** button — stores to database

### Update: `src/pages/AdminDashboard.tsx`
Add an "Activities" tab/section with:
- Table listing existing activities (topic, grade, curriculum, difficulty, status)
- "Add Activity" button opening the ActivityCreator
- Toggle active/inactive per activity
- Reorder via sort_order

---

## 4. Mission Map Component (Child Dashboard)

### New Component: `src/components/MissionMap.tsx`

A vertical winding path of level nodes:
- Fetches activities from the `activities` table filtered by child's `curriculum` and `grade`
- Fetches progress from `child_activity_progress` to determine each node's state
- Three states: **Locked** (gray, padlock icon), **Current** (pulsing sage/gold, play icon), **Completed** (gold, star icon)
- Alternating left/right offset for the winding path effect
- Dashed SVG connector lines between nodes that fill with color for completed levels
- Floating owl mascot sits on the "Current" node
- Glassmorphic "Tactile Playfulness" aesthetic with soft shadows and gradients
- Clicking a "Current" node starts a session with the activity's objectives injected into the AI tutor context

### Route & Integration
- Add route `/child/:childId/missions` in `App.tsx`
- Add a "Missions" button (map icon) to `ChildHome.tsx` in the quick-action grid
- When a mission session completes, update `child_activity_progress` to mark it as completed and unlock the next activity

---

## 5. Auto-Progression Logic

When a child completes a mission (session ends with "completed" status):
1. Mark the current activity as `completed` in `child_activity_progress`
2. Find the next activity by `sort_order` for the same curriculum/grade
3. Insert or update it as `current` in `child_activity_progress`
4. Award the activity's XP via the existing points system

This logic will live in a new hook: `src/hooks/useMissionProgress.ts`

---

## Files Created
- `src/components/MissionMap.tsx` — winding path level map
- `src/components/admin/ActivityCreator.tsx` — activity form + preview
- `src/pages/ChildMissions.tsx` — missions page wrapper
- `src/hooks/useMissionProgress.ts` — progress tracking hook

## Files Modified
- `supabase/functions/admin-dashboard/index.ts` — add `manage-activities` and `preview-activity` actions
- `supabase/functions/ai-tutor/index.ts` — accept `activity_objectives` param, add curriculum instruction helper
- `src/pages/AdminDashboard.tsx` — add Activities management section
- `src/pages/ChildHome.tsx` — add Missions quick-action button
- `src/App.tsx` — add `/child/:childId/missions` route

## Database Changes
- Create `activities` table with RLS
- Create `child_activity_progress` table with RLS

