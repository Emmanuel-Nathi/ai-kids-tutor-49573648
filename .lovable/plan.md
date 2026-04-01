

# Plan: GLB Head-Tracking Fix, Loading Skeleton, RLS Review & Webhook Hardening

## 1. Fix Head-Tracking Node Name

The uploaded `base_basic_pbr.glb` likely does not have a node named `Head`. The current code silently falls back (console warning only).

**Changes to `src/components/OwlScene.tsx`:**
- In the `useEffect`, after trying `scene.getObjectByName('Head')`, add fallback searches for common names: `head`, `Head_1`, `Head_Mesh`, or traverse the scene hierarchy to find the topmost child mesh (heuristic: highest Y-center object that isn't the root).
- Log all top-level node names to console in dev mode so you can see the actual hierarchy and hard-code the correct name once identified.
- If no named head is found, fall back to rotating the entire scene group slightly (dampened) so the effect still works.

## 2. Add Loading Skeleton for 3D Scene

**Changes to `src/components/OwlScene.tsx`:**
- Create an `OwlLoadingFallback` component: a centered `Skeleton` circle (or the `OwlMascot` 2D image) with a pulsing animation, matching the 320px container height.
- Replace the current `<Suspense fallback={null}>` with `<Suspense fallback={<OwlLoadingFallback />}>`. Since the fallback is outside the Canvas (R3F limitation), wrap the entire Canvas in a conditional or use an `Html` component from drei inside Suspense.
- Approach: Use a React state `loaded` flag set by `useGLTF`'s ready state, and overlay a skeleton div that fades out when loaded.

## 3. RLS Policy Review — Key Findings

After reviewing all tables:

| Issue | Table | Severity |
|-------|-------|----------|
| **Anon SELECT `true`** on children, messages, points, sessions, homework, reward_claims, child_badges, child_inventory, child_activity_progress, daily_logins, profiles, rewards | Multiple | Medium |
| **Anon INSERT/UPDATE without ownership check** — only checks `child_id IS NOT NULL` | child_activity_progress, child_badges, child_inventory, homework, messages, points, reward_claims, sessions, daily_logins | High |

**Key concern**: Any anonymous user can read ALL children's data, ALL messages, ALL points, and insert/update progress for ANY child by just providing a valid `child_id`. This is by design for the child-login flow (children authenticate via PIN, not Supabase auth, so they use the anon role), but it means:
- A malicious user could enumerate child IDs and read chat transcripts, points, homework.
- They could insert fake points or progress for any child.

**Recommendation** (for go-live): 
- The anon policies are a known trade-off of PIN-based child auth. To harden, the `child-login` edge function should issue a short-lived custom JWT with the child_id claim, and RLS policies should check that claim instead of blanket `true`. This is a significant architectural change — flag it but don't block launch.
- Immediate quick win: tighten the anon SELECT on `profiles` — currently allows anon to read ALL profiles (including `parent_pin` hash, `subscription_status`, `display_name`). Restrict to only columns needed or remove anon SELECT entirely (children don't need parent profiles).

**Migration:**
- Drop `Anon can view profiles` policy — children don't need to read the profiles table.

## 4. Payfast Webhook Hardening

Current issues in `supabase/functions/payfast-webhook/index.ts`:

1. **No signature verification** — Anyone can POST to the webhook and set any user's `subscription_status` to `active`. Payfast sends a `signature` field that must be validated using MD5 of the sorted params + passphrase.
2. **No IP allowlisting** — Payfast only sends ITN from specific IPs (sandbox: `197.97.145.144`; live: documented set). Should verify `req.headers.get('x-forwarded-for')` or similar.
3. **No Payfast server verification** — After receiving ITN, you should POST back to `https://www.payfast.co.za/eng/query/validate` to confirm authenticity.
4. **No idempotency** — Payfast may retry the webhook; should check if already processed.
5. **Sandbox credentials in client code** — `Paywall.tsx` has `merchantId = "10000100"` (sandbox). Needs to be swapped for production values before go-live. Store production merchant ID/key as secrets and pass via an edge function (generate the payment URL server-side) to avoid exposing credentials.
6. **Missing `payfast-webhook` in config.toml** — The function isn't listed, so it deploys with default `verify_jwt = true`, which will reject Payfast's unsigned POST requests.

**Changes to `supabase/functions/payfast-webhook/index.ts`:**
- Add `PAYFAST_PASSPHRASE` secret requirement.
- Implement signature validation: sort all received fields (excluding `signature`), concatenate as URL-encoded string, append passphrase, MD5 hash, compare to received `signature`.
- Add Payfast server validation POST to `https://www.payfast.co.za/eng/query/validate`.
- Log payment events for audit trail.
- Handle `CANCELLED` status to set `subscription_status = 'cancelled'`.

**Changes to `supabase/config.toml`:**
- Add `[functions.payfast-webhook]` with `verify_jwt = false`.

**Changes to `src/pages/Paywall.tsx`:**
- Add a TODO comment marking sandbox credentials for production swap, or move payment form generation to an edge function.

---

## Summary of Files to Change

| File | Changes |
|------|---------|
| `src/components/OwlScene.tsx` | Fallback node search for head tracking; loading skeleton overlay |
| `supabase/functions/payfast-webhook/index.ts` | Signature verification, server validation, status handling |
| `supabase/config.toml` | Add `payfast-webhook` function config |
| `src/pages/Paywall.tsx` | Mark sandbox credentials with TODO |
| DB migration | Drop anon SELECT on profiles table |

