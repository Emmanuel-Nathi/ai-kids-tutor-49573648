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
- Edge functions: ai-tutor, homework-parse, calculate-points, child-login, send-welcome-email, send-trial-warning, invite-coparent, admin-dashboard, auth-email-hook, process-email-queue (all verify_jwt=false except process-email-queue)
- Owl mascot: src/components/OwlMascot.tsx, transparent logo at src/assets/logo.png
- AppLayout: SidebarProvider wrapper for child-facing pages (AppSidebar.tsx + AppLayout.tsx)
- Child pages use AppLayout (no back buttons), Parent pages keep standalone layout

## Analytics
- PostHog: phc_CfjCPuQ7ioIArPqPWfcN0rPuYWcYL3eL5AvCoIZvAvg (US region)
- GA4: G-DKK2RDXFNT
- Events tracked: homework_uploaded, homework_completed, chat_session_started, reward_claimed, user_signed_up, begin_checkout, purchase, Subscription Started
- PostHog identify on auth state change and sign-in (with email, plan)
- Type declarations in src/types/analytics.d.ts
- Payment success tracking: ParentDashboard checks ?payment=success, fires GA4 purchase + PostHog Subscription Started, cleans URL

## Database Tables
profiles (has welcome_email_sent), user_roles, children (has access_pin), sessions, messages, homework, points, rewards, reward_claims, email_send_log, email_send_state, suppressed_emails, email_unsubscribe_tokens

## Email Infrastructure
- Domain: notify.www.aikidstutor.co.za (active_provisioning, DNS verifying)
- Email queue: pgmq-based (auth_emails + transactional_emails queues)
- process-email-queue: cron every 5s, dispatches queued emails
- auth-email-hook: branded templates (Fredoka font, orange buttons, owl theme)
- send-welcome-email & send-trial-warning: use enqueue_email RPC instead of direct API calls

## Routes
/ → Landing, /auth → Auth, /child-login → ChildLogin (PIN-based)
/parent → ParentDashboard, /parent/child/:childId → ParentChildDetail
/child/:childId → ChildHome (wrapped in AppLayout)
/child/:childId/chat, /homework, /rewards, /activities (all wrapped in AppLayout)

## Points System
- Homework upload: +10 XP, Homework complete: +20 XP
- Chat: +5 XP every 3rd message
- calculate-points edge function supports both session-based and direct child_id+amount modes
