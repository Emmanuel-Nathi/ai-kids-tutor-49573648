

# Plan: Cambridge Guardrails, Parent Surveillance, After-School Pivot & Visual Polish

## What We're Building

Four major enhancements across backend, AI, and frontend:

---

## 1. Cambridge Curriculum Guardrail Layer

**New file: `supabase/functions/ai-tutor/curriculum_context.ts`**
- A grade-to-curriculum mapping (grades 1-12) with Cambridge-specific terminology per subject
- Example: Grade 1-2 Maths uses "Number Bonds", "Part-Whole Model"; Grade 7+ uses "Algebraic Expressions", "Simultaneous Equations"
- Covers Maths, English, Science, ICT, Global Perspectives

**Update: `supabase/functions/ai-tutor/index.ts`**
- Accept `grade` and `curriculum_level` from the request body (already available from children table)
- Import curriculum context and inject grade-appropriate terminology into the system prompt dynamically
- When processing homework images, the AI references the child's grade level to explain using age-appropriate Cambridge terms

---

## 2. Parent Surveillance Dashboard

**Database migration:**
- No new tables needed — we already have `sessions`, `messages`, `points`, and `children`
- Add a database function `get_child_stats(child_id uuid)` that aggregates: total focus time, total sessions, help requests count, points earned, topic breakdown

**New page: `src/pages/ParentChildDetail.tsx`** (route: `/parent/child/:childId`)
- **Focus Time vs Help Requested**: Bar/line chart (recharts) showing daily active_time vs message count
- **Transcript Review**: Scrollable feed of AI-child messages per session, grouped by date, with session subject tags
- **Curriculum Mastery Heatmap**: Grid showing subjects (Maths, English, Science, General) vs engagement level (sessions count + time), color-coded green/yellow/red
- **PIN Protection**: Simple 4-digit PIN stored in `profiles` table (new column `parent_pin`). Toggle "Parent Mode" requires PIN entry via a dialog

**Database migration for PIN:**
- Add `parent_pin text` column to `profiles` table (nullable, set by parent)

**New route in App.tsx:** `/parent/child/:childId`

---

## 3. After-School Pivot & Point System

**Update: `supabase/functions/ai-tutor/index.ts`**
- Add logic: when the AI detects homework is complete (via conversation context), it pivots the Owl's dialogue to suggest bonus activities and announce points earned
- System prompt addition: "When the child has completed their assignment, celebrate and offer bonus activities worth extra points"

**New edge function: `supabase/functions/calculate-points/index.ts`**
- Accepts `session_id`, computes: `(active_time_minutes × focus_score) + bonus_activities`
- Focus score = `active_time / (active_time + idle_time)`
- Inserts into `points` table
- Called when a session ends

**Update: `src/pages/ChildRewards.tsx`**
- Fetch actual points from `points` table (sum for child)
- Fetch rewards from `rewards` table (parent-created)
- Allow child to "claim" a reward (insert into `reward_claims` with status "pending")
- Show pending/approved/denied claims

**Update: `src/pages/ParentDashboard.tsx`**
- Show actual point totals per child (query `points` table)
- Show pending reward claims with approve/deny buttons
- Add reward management: create rewards with name, description, point_cost

---

## 4. Visual Polish & Owl Animations

**Update: `src/components/OwlMascot.tsx`**
- Add animation variants: `idle` (current float), `celebrate` (bounce + scale), `blink` (opacity pulse), `thinking` (tilt side to side)
- Accept `variant` prop to trigger different animations via framer-motion
- Use `celebrate` when answer is correct, `thinking` during AI streaming

**Sparkle component: `src/components/Sparkle.tsx`**
- Small animated sparkle/star particles using framer-motion
- Triggered on point earn events, correct answers
- Tied to the point system visually

**Update: `src/pages/ChildChat.tsx`**
- Use `thinking` owl variant while streaming
- Trigger sparkles + `celebrate` owl when AI confirms correct answer

**Update: `src/pages/ChildHome.tsx`**
- Show actual point total in header (fetched from DB)
- Add sparkle animation on the points display

---

## Build Order

1. Database migration (add `parent_pin` to profiles)
2. `curriculum_context.ts` + update ai-tutor edge function
3. `calculate-points` edge function
4. `ParentChildDetail.tsx` with charts, transcript, heatmap, PIN protection
5. Update `ChildRewards.tsx` with real data + claim flow
6. Update `ParentDashboard.tsx` with points, reward management, claims
7. Owl animation variants + Sparkle component
8. Wire animations into Chat, Home, Rewards pages

