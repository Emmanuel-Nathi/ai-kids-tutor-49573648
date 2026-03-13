

# Plan: Add "I'm a Kid" Entry Point on Landing Page

## Problem
Children have no way to access the app from the Landing page. The `/child-login` route exists but is not discoverable. The "Get Started" button only routes to parent auth.

## Solution
Add a second button in the Landing page hero section: **"I'm a Kid 🎒"** that navigates to `/child-login`. This keeps the flow simple — parents click "Start your 30-Day Free Trial", kids click "I'm a Kid".

## Changes

### `src/pages/Landing.tsx`
- Add a secondary "I'm a Kid 🎒" button next to the existing CTA in the hero section (line 79-94)
- Use `variant="outline"` styling to differentiate from the primary parent CTA
- `onClick` navigates to `/child-login`
- Also add the same button in the header next to "Get Started" (line 57-59) as a smaller link/ghost button

### No other file changes needed
- `/child-login` route already exists in `App.tsx`
- `ChildLogin` component already has full PIN pad, loading states, and navigation to child dashboard

## Result
Landing page will have two clear entry points:
- **"Start your 30-Day Free Trial"** → `/auth` (parents)
- **"I'm a Kid 🎒"** → `/child-login` (children enter PIN)

