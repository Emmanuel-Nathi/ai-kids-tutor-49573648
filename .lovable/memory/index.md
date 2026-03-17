AI Kids Tutor - design system, architecture decisions, and key patterns

## Design System
- Primary (orange): 24 95% 53% — child-facing accent
- Secondary (blue): 217 91% 60% — secondary actions
- Accent (green): 142 71% 45% — success states
- Star gold: 45 93% 58% — points/rewards
- Owl navy: 222 47% 11% — mascot theme
- Font display: Fredoka (child-friendly)
- Font body: Inter
- Border radius: 1rem (large, rounded feel)
- Mobile-first design

## Architecture
- Auth: Supabase auth with auto-profile creation trigger
- Roles: user_roles table (parent/child enum), has_role() security definer function
- AI: Lovable AI Gateway → google/gemini-3-flash-preview, Socratic method, Cambridge curriculum
- Edge function: ai-tutor (streaming SSE, verify_jwt=false)
- Owl mascot: src/components/OwlMascot.tsx, transparent logo at src/assets/logo.png
- Code splitting: All pages lazy-loaded via React.lazy + Suspense
- Custom hooks: useChildren, useRewards, useSessionHistory (no Supabase in UI)
- Parent components split: ChildStatsRow, ActivityLog, SessionHistory, CurriculumMastery, SubjectChart
- DB indexes on: children(parent_id), points(child_id), sessions(child_id), messages(session_id), homework(child_id), reward_claims(child_id), rewards(parent_id)

## Database Tables
profiles, user_roles, children, sessions, messages, homework, points, rewards, reward_claims

## Routes
/ → Landing, /auth → Auth, /parent → ParentDashboard
/child/:childId → ChildHome, /child/:childId/chat → ChildChat
/child/:childId/homework, /child/:childId/rewards, /child/:childId/activities
