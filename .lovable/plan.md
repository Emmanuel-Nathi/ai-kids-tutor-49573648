

# Fix Google Sign-In 404 + Add Apple Sign-In

## Problem
Google OAuth returns 404 because the PWA service worker intercepts the `/~oauth` callback route. The `VitePWA` config lacks `navigateFallbackDenylist` for `/~oauth`, so the service worker serves the cached app shell instead of letting the OAuth redirect hit the network.

## Changes

### 1. `vite.config.ts` — Fix OAuth 404
Add `navigateFallbackDenylist: [/^\/~oauth/]` to the VitePWA workbox config so OAuth redirects are never cached by the service worker.

### 2. `src/pages/Auth.tsx` — Add Apple Sign-In + Loading States
- Add a loading state for OAuth buttons to prevent double-clicks
- Add an "Sign in with Apple" button below the Google button, calling `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin + '/auth' })`
- Use the standard Apple logo SVG icon

### 3. No changes to `src/integrations/lovable/index.ts`
The file already supports `"google" | "apple"` providers — no modification needed (and it's auto-generated).

## Files Summary

| File | Change |
|------|--------|
| `vite.config.ts` | Add `navigateFallbackDenylist` to fix 404 |
| `src/pages/Auth.tsx` | Add Apple sign-in button + OAuth loading states |

