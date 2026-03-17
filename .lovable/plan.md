

# Plan: Add Forgot Password Flow

## Overview
Add a "Forgot Password?" link on the auth page and a dedicated `/reset-password` page to complete the password reset flow. The email domain is already verified, so recovery emails will work.

## Changes

### 1. `src/pages/Auth.tsx`
- Add a "Forgot Password?" link below the password field (visible only on sign-in mode)
- Add a `forgotPassword` state toggle that shows an email-only form
- In forgot-password mode, call `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Show success toast instructing user to check their inbox

### 2. `src/pages/ResetPassword.tsx` (new file)
- Public page at `/reset-password`
- Detects `type=recovery` from the URL hash (Supabase appends this)
- Shows a "Set New Password" form with password + confirm password fields
- Calls `supabase.auth.updateUser({ password })` to update the password
- On success, redirects to `/auth` with a success toast
- Uses OwlMascot and Card layout consistent with the Auth page

### 3. `src/App.tsx`
- Add route: `<Route path="/reset-password" element={<ResetPassword />} />`
- Import `ResetPassword` component

## No database or backend changes needed
The email domain is verified and recovery emails are already supported by the auth email hook.

