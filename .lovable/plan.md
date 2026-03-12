

# Plan: Anti-Rush Timer + Privilege Store (XP Deduction)

## 1. Anti-Rush Timer Logic

**Problem:** Kids can rush through activities to farm XP without learning.

**Approach:** Add a minimum time threshold per activity in the chat page. When the session has been active for less than the minimum (e.g., 3 minutes), block XP awards and show "Whoa there, Speedster! 🏎️" message.

**Changes:**
- **`src/pages/ChildChat.tsx`**: Track session start time. Before awarding XP (every 3rd message), check if at least 3 minutes have elapsed. If not, show a friendly toast instead of awarding XP.
- **`supabase/functions/calculate-points/index.ts`**: Add server-side validation — reject direct point awards if the session's `started_at` is less than 3 minutes ago (for session-based mode). This prevents bypassing the client check.

## 2. Privilege Store (XP Deduction on Claim)

**What exists:** Parents can already create rewards in the `rewards` table, and children can claim them via `reward_claims`. But currently claims don't deduct XP — they just go to "pending."

**What's missing:** When a child claims a reward, deduct the point cost immediately by inserting a negative amount into the `points` table. The parent already gets notified via the existing realtime `points` subscription.

**Changes:**
- **`src/pages/ChildRewards.tsx`**: On `claimReward`, insert a negative points record (`-point_cost`) with reason like "🎁 Redeemed: 1 Hour PlayStation". This deducts XP immediately and triggers the parent's realtime notification toast ("Liam spent 200 XP on 1 Hour PlayStation!").
- **`src/pages/ParentDashboard.tsx`**: Update the realtime notification handler to show a different message for negative points (redemptions vs earnings). Also add a realtime subscription to `reward_claims` so parent sees "Liam just claimed 1 Hour of PlayStation!" toast.

**RLS consideration:** The `points` INSERT policy requires `children.parent_id = auth.uid()`. Since the child isn't authenticated as the parent, the deduction must go through the `calculate-points` edge function (which uses service role). I'll route the deduction through that function.

- **`supabase/functions/calculate-points/index.ts`**: Support negative amounts for redemptions (already works with direct `child_id + amount` mode, just need to allow negative).

## Files to Change

| File | Change |
|------|--------|
| `src/pages/ChildChat.tsx` | Add 3-minute anti-rush check before XP awards |
| `src/pages/ChildRewards.tsx` | Deduct XP via calculate-points edge function on claim |
| `src/pages/ParentDashboard.tsx` | Handle negative points in notification + add claims realtime |
| `supabase/functions/calculate-points/index.ts` | Add server-side anti-rush check, allow negative amounts |

No database migration needed — existing tables support this.

