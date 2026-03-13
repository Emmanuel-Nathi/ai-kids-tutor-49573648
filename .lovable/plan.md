

# Plan: Child Profile Email + Cookie Consent + Logo in Emails

## 1. Transactional Email: Child Profile Added

**`supabase/functions/send-child-added-email/index.ts`** — New edge function. When a parent adds a child, sends a branded email confirming the child's name, grade, and curriculum. Includes the owl logo and a CTA to log in.

**`src/components/ChildSetupWizard.tsx`** — After successful child insert (line 58), invoke the edge function via `supabase.functions.invoke('send-child-added-email', { body: { child_name, grade, curriculum } })`.

**`supabase/config.toml`** — Add `send-child-added-email` function entry with `verify_jwt = false`.

## 2. Cookie Consent Banner

**`src/components/CookieConsent.tsx`** — New component. Fixed bottom banner with:
- Text: "We use cookies to improve your tutoring experience and analyze our traffic. By clicking Accept, you consent to our use of cookies in line with POPIA."
- "Accept" button saves `cookie_consent = "true"` to localStorage and hides the banner
- "Privacy Policy" link (opens `/privacy` or a placeholder anchor)
- Only shows if `localStorage.getItem('cookie_consent')` is not `"true"`

**`src/pages/Landing.tsx`** — Import and render `<CookieConsent />` at the bottom of the page.

## 3. Logo in All Emails

The logo at `src/assets/logo.png` is a local file (owl on black background). For emails, we need a publicly accessible URL. The published app serves static assets, so the logo URL will be: `https://ai-kids-tutor.lovable.app/assets/logo.png` (or we use the Vite-hashed path).

A more reliable approach: upload the logo to the `homework-uploads` bucket as a public asset, or reference the favicon. Actually, the simplest approach is to use the published app's logo URL directly.

**All email templates** (`signup.tsx`, `recovery.tsx`, `magic-link.tsx`, `invite.tsx`, `email-change.tsx`, `reauthentication.tsx`) — Add an `<Img>` component at the top showing the owl logo from the published URL.

**`send-welcome-email/index.ts`** and **`send-trial-warning/index.ts`** — Add the same logo `<img>` tag at the top of the inline HTML.

**`send-child-added-email/index.ts`** — Include the logo in the new template.

**Logo URL**: Use `https://ai-kids-tutor.lovable.app/lovable-uploads/logo.png` — we'll copy the logo to the `public/` folder as `public/email-logo.png` so it's served at a stable URL: `https://ai-kids-tutor.lovable.app/email-logo.png`.

## 4. Fix enqueue_email RPC calls

The `send-welcome-email` and `send-trial-warning` functions use wrong parameter names (`p_queue_name`, `p_to_email`, etc.). The actual RPC signature is `enqueue_email(queue_name text, payload jsonb)`. Fix both to match the auth-email-hook pattern.

## Files Summary

| File | Action |
|------|--------|
| `public/email-logo.png` | Create — copy of logo for stable email URL |
| `src/components/CookieConsent.tsx` | Create — POPIA cookie consent banner |
| `src/pages/Landing.tsx` | Edit — add CookieConsent component |
| `src/components/ChildSetupWizard.tsx` | Edit — invoke child-added email after insert |
| `supabase/functions/send-child-added-email/index.ts` | Create — transactional email edge function |
| `supabase/config.toml` | Edit — add new function entry |
| `supabase/functions/_shared/email-templates/signup.tsx` | Edit — add logo |
| `supabase/functions/_shared/email-templates/recovery.tsx` | Edit — add logo |
| `supabase/functions/_shared/email-templates/magic-link.tsx` | Edit — add logo |
| `supabase/functions/_shared/email-templates/invite.tsx` | Edit — add logo |
| `supabase/functions/_shared/email-templates/email-change.tsx` | Edit — add logo |
| `supabase/functions/_shared/email-templates/reauthentication.tsx` | Edit — add logo |
| `supabase/functions/send-welcome-email/index.ts` | Edit — add logo + fix enqueue params |
| `supabase/functions/send-trial-warning/index.ts` | Edit — add logo + fix enqueue params |

