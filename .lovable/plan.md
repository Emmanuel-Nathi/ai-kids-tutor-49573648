

# Plan: Landing Page Redesign + Grade Selection Wizard + Email Automation

The user's message bundles several requests. Here is the consolidated plan.

---

## 1. Conversion-Optimized Landing Page

### Edit: `src/pages/Landing.tsx` (full rewrite)

Replace the current simple landing with a conversion-focused page:
- **Hero section**: Bold headline "Stop fighting over homework.", subheadline about Socratic AI aligned to CAPS/IEB, primary CTA "Start your 30-Day Free Trial"
- **How it Works grid**: 3 cards — "Socratic AI Guidance" (Sparkles icon), "Real-World Rewards" (Gift icon), "Parent Analytics" (LineChart icon)
- **Pricing section**: "Free for 30 Days, then R199.99/month" with clean card layout
- Keep existing auth redirect logic for logged-in users
- White/blue/gray palette, clear visual hierarchy, mobile-first

---

## 2. ChildSetupWizard — Add Grade Selection (Step 3)

### Edit: `src/components/ChildSetupWizard.tsx`

- Add `grade` state (default empty string)
- Change from 3 steps to 4 steps:
  - Step 1: Name (unchanged)
  - Step 2: Curriculum (unchanged)
  - **Step 3 (NEW)**: Grade selection — scrollable grid of buttons for Grade 1 through Grade 8
  - Step 4: PIN setup (was step 3)
- Update `canNext` logic to include grade validation at step 3
- Update progress dots from 3 to 4
- Update owl messages to include step 3: "What grade are they in?"
- Update `handleComplete` to use selected `grade` instead of hardcoded `"1"`
- Navigation buttons: step < 4 shows "Next", step 4 shows "Complete Setup"

---

## 3. Welcome Email (Edge Function + Database Webhook)

### Create: `supabase/functions/send-welcome-email/index.ts`

- Edge function triggered by database webhook on `profiles` table INSERT
- Uses Lovable's built-in transactional email system (not Resend — per Lovable guidelines)
- Sends a branded welcome email with onboarding info and CTA

However, since Lovable has a built-in email system, I should use `scaffold_transactional_email` for this rather than manually creating edge functions with third-party services like Resend. The welcome email and trial warning are transactional emails.

**Approach**: Use Lovable's transactional email tooling:
1. Scaffold a "welcome" transactional email template
2. Scaffold a "trial-warning" transactional email template
3. Wire triggers: welcome on profile creation, trial-warning via scheduled cron

**Prerequisite**: The user needs a custom email domain configured first. I'll check if one exists and guide accordingly.

---

## 4. 3-Day Trial Warning Email (Cron Job)

### Database changes needed:
- Enable `pg_cron` and `pg_net` extensions
- Create a cron job that runs daily, queries `profiles` where `subscription_status = 'trial'` and `created_at` is ~27 days ago (30-day trial minus 3), then invokes the trial-warning edge function

---

## 5. PWA Icons

The PWA icon files already exist at `public/pwa-192x192.png` and `public/pwa-512x512.png` (created in a previous step). Since I cannot generate image files, I'll note that the user should replace these with properly sized versions of their owl logo. The `vite.config.ts` manifest already references them.

---

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | Rewrite — conversion-optimized landing page |
| `src/components/ChildSetupWizard.tsx` | Edit — add grade selection as step 3, make 4 steps |
| Email setup | Requires email domain configuration first — will prompt user |

## Questions Before Implementation

I need to clarify the email setup before proceeding, as Lovable requires a custom email domain for transactional emails. I'll handle PWA icons, landing page, and wizard changes immediately, and address email setup as a follow-up step.

