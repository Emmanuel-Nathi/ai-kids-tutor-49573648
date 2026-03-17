

# Create `useChildData` Hook & Refactor Child Pages

## What it does
Extract the duplicated child profile/XP/streak fetching logic from `ChildHome`, `ChildProfile`, and `ChildRewards` into a single `useChildData` hook.

## The hook: `src/hooks/useChildData.ts`

Returns `{ child, totalPoints, streak, sessionCount, rewards, claims, loading, refetch }`.

Fetches in parallel:
- Child profile from `children` table (name, grade, curriculum, language, etc.)
- Total XP from `points` table (sum of amounts)
- Streak + session count from `sessions` table (same streak algorithm already used)
- Active rewards via child's `parent_id` from `rewards` table
- Claims from `reward_claims` table

All fetched with `Promise.all` in a single `useCallback`.

## Files changed

| File | Change |
|---|---|
| `src/hooks/useChildData.ts` | **New** — the shared hook |
| `src/pages/ChildHome.tsx` | Remove 4 state vars + useEffect fetch block, use `useChildData` instead |
| `src/pages/ChildProfile.tsx` | Remove 4 state vars + useEffect fetch block, use `useChildData` instead |
| `src/pages/ChildRewards.tsx` | Remove `totalPoints`, `rewards`, `claims` state + `fetchData()`, use `useChildData` instead. Keep `claimReward` and UI-only state (`showSparkle`, `claimingId`) local. |

## Hook interface

```ts
export function useChildData(childId: string | undefined) {
  // Returns:
  child: { id, name, grade, selected_curriculum, preferred_language, ... } | null
  totalPoints: number
  streak: number
  sessionCount: number
  rewards: Reward[]
  claims: Claim[]
  loading: boolean
  refetch: () => Promise<void>
}
```

## Key details
- Streak calculation uses existing algorithm (consecutive days from today)
- Rewards fetched by looking up `parent_id` from the child record, then querying `rewards` where `is_active = true`
- `refetch` exposed so `ChildRewards` can call it after claiming a reward
- No breaking changes to routes or UI rendering

