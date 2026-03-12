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
- Edge functions: ai-tutor, homework-parse, calculate-points, child-login (all verify_jwt=false)
- Owl mascot: src/components/OwlMascot.tsx, transparent logo at src/assets/logo.png
- AppLayout: SidebarProvider wrapper for child-facing pages (AppSidebar.tsx + AppLayout.tsx)
- Child pages use AppLayout (no back buttons), Parent pages keep standalone layout

## Database Tables
profiles, user_roles, children (has access_pin), sessions, messages, homework, points, rewards, reward_claims

## Routes
/ → Landing, /auth → Auth, /child-login → ChildLogin (PIN-based)
/parent → ParentDashboard, /parent/child/:childId → ParentChildDetail
/child/:childId → ChildHome (wrapped in AppLayout)
/child/:childId/chat, /homework, /rewards, /activities (all wrapped in AppLayout)

## Points System
- Homework upload: +10 XP, Homework complete: +20 XP
- Chat: +5 XP every 3rd message
- calculate-points edge function supports both session-based and direct child_id+amount modes
