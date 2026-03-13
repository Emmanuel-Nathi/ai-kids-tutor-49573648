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
- Edge functions: ai-tutor, homework-parse, calculate-points, child-login, send-welcome-email, send-trial-warning, invite-coparent, admin-dashboard (all verify_jwt=false)
- Owl mascot: src/components/OwlMascot.tsx, transparent logo at src/assets/logo.png
- AppLayout: SidebarProvider wrapper for child-facing pages (AppSidebar.tsx + AppLayout.tsx)
- Child pages use AppLayout (no back buttons), Parent pages keep standalone layout

## Analytics
- PostHog: phc_85IDA0KgURTFV76O3gPlPvAGPLYhrlwbhfe6isvVHx (US region)
- GA4: G-DKK2RDXFNT
- Events tracked: homework_uploaded, homework_completed, chat_session_started, reward_claimed, user_signed_up, begin_checkout
- PostHog identify on auth state change and sign-in (with email, plan)
- Type declarations in src/types/analytics.d.ts

## Database Tables
profiles (has welcome_email_sent), user_roles, children (has access_pin), sessions, messages, homework, points, rewards, reward_claims

## Transactional Emails
- Domain: notify.www.soulfulsound.co.za (verified)
- send-welcome-email: triggered on first login, branded HTML
- send-trial-warning: daily cron at 9am UTC, targets trial users at day 25 (5 days before expiry)

## Routes
/ → Landing, /auth → Auth, /child-login → ChildLogin (PIN-based)
/parent → ParentDashboard, /parent/child/:childId → ParentChildDetail
/child/:childId → ChildHome (wrapped in AppLayout)
/child/:childId/chat, /homework, /rewards, /activities (all wrapped in AppLayout)

## Points System
- Homework upload: +10 XP, Homework complete: +20 XP
- Chat: +5 XP every 3rd message
- calculate-points edge function supports both session-based and direct child_id+amount modes
