

# Remaining Enhancements: Confetti, Coming Soon, Inner Header Polish

## What's Already Done (No Action Needed)

The previous implementation rounds already covered:
- Trust badges (CAPS, IEB, Cambridge) — already in the hero section
- Sticky glassmorphic header on landing — already `sticky top-0 z-50` with glass styling
- Photo-to-Help multimodal AI — implemented in AIHomeworkHelper + ai-tutor edge function
- Referral Loop — profiles table has referral_code/referred_by, Invite card on ParentDashboard
- Weekly Digest — send-weekly-summary edge function exists
- LoadingButton — created and applied to Auth, Wizard, Paywall
- 3D lazy loading — OwlScene uses react-intersection-observer
- Message trimming — ai-tutor trims to first 2 + last 8 messages
- Glassmorphism on MissionMap — topic labels have `backdrop-blur-md bg-white/20 border-white/20`
- RLS — verified on profiles, rewards, children, sessions, etc.

## What's Actually New (3 items)

### 1. XP Confetti Micro-Interactions
- Install `canvas-confetti` (~2KB)
- In `ParentDashboard.tsx`, the realtime XP listener (line ~146) currently fires a `toast.info`. Add a confetti burst alongside the toast when XP is earned (positive amount)
- In the child-facing pages where XP is awarded (e.g., mission completion in `ChildMissions`, homework completion), trigger confetti on the success callback
- Create a small `useConfetti` hook that wraps `canvas-confetti` for reuse

### 2. "Coming Soon" Placeholder in Mission Map
- In `MissionMap.tsx`, after the last mission node, append a "Coming Soon" placeholder node
- Style it with a dashed border, muted colors, and a sparkle/lock icon
- Label it "More adventures coming soon!" to set expectations

### 3. Inner App Header Polish
- In `AppLayout.tsx`, the inner header (line 15) uses `bg-card` with no blur
- Add `backdrop-blur-md bg-card/80` for the frosted glass effect matching the landing page
- Ensure `sticky top-0 z-40` so it doesn't jump when sidebar opens on mobile

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `canvas-confetti` dependency |
| `src/hooks/useConfetti.ts` | Create — thin wrapper around canvas-confetti |
| `src/pages/ParentDashboard.tsx` | Fire confetti on XP earn notification |
| `src/pages/ChildMissions.tsx` | Fire confetti on mission complete |
| `src/components/MissionMap.tsx` | Add "Coming Soon" placeholder node at end |
| `src/components/AppLayout.tsx` | Add backdrop-blur to inner header |

