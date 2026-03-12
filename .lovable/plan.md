

# Plan: Navigation, Onboarding, Homework-to-Hero Loop, and Points System Enhancements

## Overview

This plan covers five areas: (1) responsive navigation with hamburger/side-nav, (2) kid profile onboarding with unique kid links, (3) "Mark as Complete" homework-to-hero reward loop, (4) curriculum-aware extra-curriculum activities, and (5) real-time daily activity log on the parent dashboard.

Most of the requested infrastructure already exists (points table, reward_claims, sessions, AI tutor with Socratic guardrails, homework scanner, CAPS/IEB support). This plan focuses on the missing pieces.

---

## 1. Responsive Navigation (Sidebar + Hamburger)

**Create `src/components/AppSidebar.tsx`** using the existing Shadcn Sidebar component:
- Links: Home (`/`), Learning Hub (`/child/:childId`), Extra Curriculum (`/child/:childId/activities`), Parent Dashboard (`/parent` — PIN protected), Profile
- Show hamburger trigger on mobile, collapsed icon sidebar on desktop

**Create `src/components/AppLayout.tsx`** wrapper with `SidebarProvider`:
- Used by child-facing pages (`ChildHome`, `ChildChat`, `ChildHomework`, `ChildRewards`, `ChildActivities`)
- Passes `childId` as context for nav links
- Header includes `SidebarTrigger` (always visible)

**Update `App.tsx`**: Wrap child routes in `AppLayout`. Landing, Auth, and Parent pages keep their current layout.

---

## 2. Kid Profile Onboarding & Unique Kid Links

**Update `ParentDashboard.tsx`**:
- After adding a child, display a shareable "Kid Link" (`/child/:childId`) that can be copied or shared
- Add a "Copy Link" button on each child card
- Add a "Generate PIN" option per child (store on `children` table)

**Database migration**: Add `access_pin text` column to `children` table for optional PIN-based child login.

**Create `src/pages/ChildLogin.tsx`**: A simple page at `/child-login` where a child enters their name + PIN to access their dashboard (no email/password needed). Validates against the `children` table.

**Update `App.tsx`**: Add `/child-login` route.

---

## 3. Homework-to-Hero "Mark as Complete" Loop

**Update `ChildHomework.tsx`**:
- Add a "Mark as Complete ✅" button after problems are displayed
- On click: update homework status to `completed`, call `calculate-points` edge function to award 20 XP
- Show celebratory owl animation + message: "High five! ✋ You earned 20 XP! Try an Extra-Curricular challenge below!"
- Display 2-3 curriculum-aware activity cards (from ChildActivities data) inline

**Update `supabase/functions/calculate-points/index.ts`**:
- Accept `child_id`, `amount`, `reason`
- Insert into `points` table using service role key
- Return new total

---

## 4. Curriculum-Aware Extra Curriculum Activities

**Update `ChildActivities.tsx`**:
- Fetch child's `selected_curriculum` and `grade` from DB
- Show curriculum-specific activities:
  - CAPS: "South African History Quiz", "Life Orientation Challenge", "Heritage Day Project"
  - IEB: "Critical Thinking Puzzle", "Analytical Writing", "Research Project"
  - Cambridge: "Science Investigation", "Global Perspectives", "Coding Challenge"
- Each activity card links to a chat session with the activity as context
- Award points (10 XP) when an activity chat session reaches 5+ messages

---

## 5. Real-Time Daily Activity Log on Parent Dashboard

**Update `ParentChildDetail.tsx`**:
- Add a "Daily Activity Log" section showing chronological feed of:
  - Homework uploads + completions
  - Chat sessions started/ended
  - Points earned (with reason)
  - Reward claims
- Query across `points`, `sessions`, `homework`, `reward_claims` tables filtered by today's date
- Use Supabase realtime subscription on `points` table for live updates

**Update `ParentDashboard.tsx`**:
- Add real-time point totals using TanStack Query with Supabase realtime invalidation

---

## 6. Points Increment on Every Interaction

**Update `ChildChat.tsx`**:
- After each user message (every 3rd message to avoid spam), auto-award 5 XP via the `calculate-points` edge function
- Display a subtle "+5 XP" toast animation

**Update `ChildHomework.tsx`**:
- Award 10 XP on homework upload, 20 XP on completion

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/AppSidebar.tsx` | Create — responsive nav sidebar |
| `src/components/AppLayout.tsx` | Create — layout wrapper with sidebar |
| `src/pages/ChildLogin.tsx` | Create — PIN-based child login |
| `src/pages/ChildHome.tsx` | Update — use AppLayout |
| `src/pages/ChildChat.tsx` | Update — auto XP on messages |
| `src/pages/ChildHomework.tsx` | Update — Mark as Complete + XP |
| `src/pages/ChildActivities.tsx` | Update — curriculum-aware content |
| `src/pages/ChildRewards.tsx` | Update — use AppLayout |
| `src/pages/ParentDashboard.tsx` | Update — copy kid link, realtime points |
| `src/pages/ParentChildDetail.tsx` | Update — daily activity log |
| `src/App.tsx` | Update — add routes, AppLayout |
| `supabase/functions/calculate-points/index.ts` | Update — points insertion logic |
| DB migration | Add `access_pin` to `children` table |

## Build Order

1. DB migration (access_pin column)
2. AppSidebar + AppLayout components
3. ChildLogin page + route
4. Update calculate-points edge function
5. Update ChildHomework with Mark as Complete + XP
6. Update ChildActivities with curriculum content
7. Update ChildChat with auto XP
8. Update ParentDashboard with kid links + realtime
9. Update ParentChildDetail with daily activity log
10. Wire AppLayout into child routes

