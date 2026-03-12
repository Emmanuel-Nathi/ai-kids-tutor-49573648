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
- AI: Lovable AI Gateway → google/gemini-3-flash-preview (tutor), google/gemini-2.5-pro (vision/homework)
- Curricula: Cambridge, CAPS, IEB — stored as selected_curriculum on children table
- Language support: english, afrikaans, isizulu — stored as preferred_language on children table
- Edge functions: ai-tutor (streaming SSE), calculate-points, homework-parse (vision OCR)
- Owl mascot: src/components/OwlMascot.tsx, logo at src/assets/logo.png (user-uploaded)

## Database Tables
profiles, user_roles, children (+ selected_curriculum, preferred_language), sessions (+ interaction_summary, curriculum_alignment_score), messages, homework, points, rewards, reward_claims

## Routes
/ → Landing, /auth → Auth, /parent → ParentDashboard
/parent/child/:childId → ParentChildDetail
/child/:childId → ChildHome, /child/:childId/chat → ChildChat
/child/:childId/homework, /child/:childId/rewards, /child/:childId/activities
