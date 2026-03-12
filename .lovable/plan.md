

# AI Kids Tutor - Full Stack Build Plan

## Overview

A mobile-first EdTech app with two interfaces: a bright, gamified **Child Tutor** (featuring the Owl mascot) and a data-driven **Parent Dashboard**. Powered by Lovable Cloud (Supabase) for auth, database, and AI via the Lovable AI Gateway.

---

## Architecture

```text
┌─────────────────────────────────────────────┐
│              React Frontend (SPA)           │
│  ┌──────────────┐   ┌───────────────────┐   │
│  │ Child Views   │   │ Parent Dashboard  │   │
│  │ - Chat/Tutor  │   │ - Session Logs    │   │
│  │ - HW Scanner  │   │ - Points/Rewards  │   │
│  │ - Rewards     │   │ - Child Profiles  │   │
│  └──────────────┘   └───────────────────┘   │
└──────────────┬──────────────────────────────┘
               │
     ┌─────────▼─────────┐
     │  Lovable Cloud     │
     │  (Supabase)        │
     │  - Auth (parents)  │
     │  - Database        │
     │  - Storage (HW)    │
     │  - Edge Functions  │
     │    └─ AI Gateway   │
     └────────────────────┘
```

---

## Database Schema

**Tables:**
- `profiles` — parent accounts (linked to auth.users)
- `children` — child profiles (linked to parent, name, grade, curriculum_level)
- `user_roles` — role enum (parent, child) per security requirements
- `sessions` — tutoring sessions (child_id, start/end, active_time, idle_time, status, subject)
- `messages` — AI-child chat log (session_id, role, content, timestamp)
- `homework` — uploaded homework (child_id, image_url, subject, status: pending/in_progress/complete)
- `points` — point ledger (child_id, amount, reason, timestamp)
- `rewards` — reward catalog (name, point_cost, parent-approved boolean)
- `reward_claims` — child claims, parent approval status

**Storage bucket:** `homework-uploads` (for worksheet photos)

---

## Key Screens & Routes

| Route | View | Description |
|-------|------|-------------|
| `/` | Landing/Login | Welcome page with Owl mascot |
| `/auth` | Auth page | Parent signup/login |
| `/parent` | Parent Dashboard | Overview of children, sessions, points |
| `/parent/child/:id` | Child Detail | Session logs, interaction history |
| `/parent/rewards` | Reward Management | Approve/deny reward claims |
| `/child/:id` | Child Home | Welcome screen with Owl, subject selection |
| `/child/:id/chat` | AI Tutor Chat | Main tutoring interface with Socratic AI |
| `/child/:id/homework` | Homework Scanner | Photo upload + guided problem solving |
| `/child/:id/rewards` | Rewards Store | View points, claim rewards |
| `/child/:id/activities` | After-School | Extra-curricular suggestions post-homework |

---

## Edge Functions

1. **`ai-tutor`** — Streams AI responses via Lovable AI Gateway. System prompt enforces Cambridge curriculum, Socratic method, blocks non-educational topics, encouraging tone. Logs all messages to DB.

2. **`homework-parse`** — Receives uploaded homework image, sends to AI with vision capabilities (Gemini 2.5 Pro) to extract problems, returns structured problem list.

3. **`calculate-points`** — Computes points: `(TimeSpent × FocusScore) + BonusActivities`. Called on session end.

---

## AI Configuration

- **Model:** `google/gemini-2.5-pro` (supports image input for homework scanning)
- **System prompt:** Strictly Cambridge curriculum-aligned, Socratic method, encouraging/patient/witty tone, blocks off-topic queries, never gives direct answers
- **Safety guardrails:** No PII collection beyond what parent provides, content filtering for child safety

---

## Design System

- **Child UI:** Bright colors (orange #F97316, blue #3B82F6, navy from owl logo #1E293B), rounded corners, large touch targets, Owl mascot throughout, playful animations
- **Parent UI:** Clean, minimal, data-focused with charts (recharts), neutral tones
- **Mobile-first:** All layouts designed for small screens first

---

## Gamification Logic

- Points calculated per session: `(activeMinutes × focusScore) + bonusActivities`
- Focus score = `activeTime / totalSessionTime` (0-1 scale)
- Bonus activities: coding puzzles, logic games, creative writing (10-25 pts each)
- "After-School Pivot": when homework status = complete, AI suggests activities from Cambridge learner attributes (inquirers, thinkers, communicators, etc.)

---

## Build Order

1. **Enable Lovable Cloud** — set up database, auth, storage
2. **Auth + profiles + children tables** — parent signup, child profile CRUD
3. **Child tutor chat** — AI edge function, streaming chat UI with Owl mascot
4. **Homework scanner** — image upload to storage, AI vision parsing, guided solving
5. **Session tracking** — active/idle time logging, message history
6. **Points & rewards system** — calculation logic, reward store, parental approval
7. **Parent dashboard** — session reports, interaction logs, charts
8. **After-school activities** — post-homework pivot with activity suggestions
9. **Safety & polish** — content guardrails, PII handling, responsive refinements

---

## Security Considerations

- Roles stored in `user_roles` table (not on profiles) with RLS
- Children cannot access parent dashboard routes
- All AI interactions logged for parental review
- Image uploads restricted to authenticated sessions
- Edge functions validate auth tokens before processing

