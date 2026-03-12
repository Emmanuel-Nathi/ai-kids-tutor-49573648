

# Assessment: Current State vs. Requested Features

After thorough review, **~95% of what you described is already implemented**. Here's what exists and the few gaps to close.

## Already Implemented

| Feature | Status |
|---------|--------|
| Responsive Sidebar + Hamburger (Shadcn) | Done — `AppSidebar.tsx`, `AppLayout.tsx` |
| Home, Learning Hub, Homework, Activities, Rewards, Parent Dashboard nav | Done |
| Parent-Child linking (`parent_id` on `children` table) | Done |
| Child Profile onboarding in Parent Dashboard | Done — add child dialog with grade, curriculum, language |
| PIN-based child login (`access_pin` column, `/child-login` route, edge function) | Done |
| Kid Link copy button | Done |
| Socratic AI system prompt (no direct answers, leading questions, Owl persona) | Done — `ai-tutor/index.ts` |
| Cambridge, CAPS, IEB curriculum maps (Gr 1-12) with grade-specific topics | Done — `curriculum_context.ts` |
| Homework photo upload + AI parse (`homework-parse` edge function) | Done |
| "Mark as Complete" button → +20 XP → Owl celebration → Brain Boost pivot | Done — `ChildHomework.tsx` |
| Curriculum-aware extra-curriculum activities (CAPS: SA History, IEB: Critical Thinking, etc.) | Done — `ChildActivities.tsx` |
| Points system (upload: +10 XP, complete: +20 XP, chat every 3rd msg: +5 XP) | Done |
| Reward Shop (kids claim, parents approve/deny) | Done — `ChildRewards.tsx`, `ParentDashboard.tsx` |
| Daily Activity Log on Parent Detail page | Done — `ParentChildDetail.tsx` |
| Real-time points subscription | Done |
| Content safety filter in AI system prompt | Done |
| Age-appropriate language enforcement | Done |
| Message logging to `messages` table | Done |
| Owl mascot celebrations with sparkle animations | Done |

## Remaining Gaps (Minor Enhancements)

### 1. Enhanced Socratic System Prompt
The current prompt is strong but missing the exact "OCR & Context → Encouragement → Socratic Step → Safety" structured flow you specified, and the explicit "Homework Complete" trigger instruction telling the AI to instruct kids to click "Mark as Complete."

**Change:** Update the `SYSTEM_PROMPT` in `supabase/functions/ai-tutor/index.ts` to incorporate your exact 4-step response structure and the "Homework Complete" trigger language.

### 2. PIN-Protected Parent Dashboard Access from Sidebar
The sidebar links to `/parent` directly. Your spec calls for a PIN modal when clicking "Parent Dashboard" from the child-facing sidebar. Currently, `ParentChildDetail` has PIN protection but the main Parent Dashboard does not gate access from the child side.

**Change:** Add a PIN verification modal in `AppSidebar.tsx` that intercepts the Parent Dashboard link click, prompts for the parent PIN (from `profiles.parent_pin`), and only navigates on success. Include 3-attempt lockout with 30-second cooldown.

### 3. Pre-populated SA Extra-Curriculum Challenges
Your spec lists 5 specific South African challenges with exact point values (Great SA Map Challenge: 50pts, Legacy of a Hero: 60pts, etc.). These aren't in the activities data yet.

**Change:** Add these 5 challenges as additional entries in the `activitiesByCurriculum` data in `ChildActivities.tsx`, with their specific point values and chat contexts.

### 4. Profile Page
The sidebar has a "Profile" concept but no dedicated Profile page exists for the child to see their name, avatar, curriculum, and stats.

**Change:** Create `src/pages/ChildProfile.tsx` showing child info, total XP, streak, and curriculum. Add route in `App.tsx`.

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/ai-tutor/index.ts` | Update SYSTEM_PROMPT with 4-step Socratic structure + homework trigger |
| `src/components/AppSidebar.tsx` | Add PIN modal for Parent Dashboard link |
| `src/pages/ChildActivities.tsx` | Add 5 SA-specific challenges with point values |
| `src/pages/ChildProfile.tsx` | Create — child profile page |
| `src/App.tsx` | Add `/child/:childId/profile` route |

## Build Order
1. Update AI tutor system prompt
2. Add PIN protection to Parent Dashboard sidebar link
3. Add SA challenges to activities
4. Create child profile page + route

