

# Performance & Architecture Optimization Plan

## 1. Code Splitting with React.lazy + Suspense

**`src/App.tsx`** — Lazy-load all page components so the initial bundle only contains the landing page. Children won't download admin code, parents won't download child chat code.

```tsx
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const ChildChat = lazy(() => import("./pages/ChildChat"));
// ... all page imports become lazy
```

Wrap routes in `<Suspense fallback={<OwlMascot loading />}>`.

## 2. Extract Custom Hooks (Remove Supabase from UI)

Create focused hooks that encapsulate data fetching:

- **`src/hooks/useChildren.ts`** — Fetches children + stats, used by ParentDashboard. Returns `{ children, loading, refetch }`.
- **`src/hooks/useChildProfile.ts`** — Fetches single child name, curriculum, points, streak. Used by ChildHome.
- **`src/hooks/useRewards.ts`** — Fetches rewards + claims. Used by ParentDashboard rewards tab.
- **`src/hooks/useSessionHistory.ts`** — Fetches sessions with messages for ParentChildDetail.

This moves ~150 lines of fetch logic out of ParentDashboard alone.

## 3. Break Up Large Components

**ParentDashboard (523 lines) → split into:**
- `ParentDashboard.tsx` — shell with tabs
- `components/parent/ChildrenTab.tsx` — children list + add child dialog
- `components/parent/RewardsTab.tsx` — rewards list + claims + add reward
- `components/parent/AccountTab.tsx` — subscription + co-parent invite

**ParentChildDetail (480 lines) → split into:**
- `ParentChildDetail.tsx` — layout + PIN gate
- `components/parent/ChildStatsRow.tsx`
- `components/parent/ActivityLog.tsx`
- `components/parent/SessionHistory.tsx`
- `components/parent/CurriculumMastery.tsx`

**AIHomeworkHelper (220 lines)** — already reasonable size, but extract the speech recognition logic into `hooks/useSpeechRecognition.ts`.

## 4. Memoization for Charts

In `ParentChildDetail` and `ParentAnalytics`, wrap chart data calculations with `useMemo`:

```tsx
const chartData = useMemo(() => Object.values(subjectStats), [sessions]);
const struggling = useMemo(() => stats.filter(...).sort(...)[0], [stats]);
```

## 5. Database Indexes

Add indexes on frequently queried foreign key columns. Note: `profiles` does NOT have a `parent_id` column, and `activity_logs` table doesn't exist. The correct indexes based on actual schema:

```sql
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_points_child_id ON points(child_id);
CREATE INDEX IF NOT EXISTS idx_sessions_child_id ON sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_homework_child_id ON homework(child_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_child_id ON reward_claims(child_id);
CREATE INDEX IF NOT EXISTS idx_rewards_parent_id ON rewards(parent_id);
```

## 6. Fix N+1 Query in ParentDashboard

`fetchAll()` currently loops through each child and makes 2 separate queries (points + sessions count). Replace with a single batch approach using `.in("child_id", childIds)` for points, then aggregate client-side.

## Summary of files changed

| Change | Files |
|---|---|
| Lazy loading | `src/App.tsx` |
| New hooks | 4 new files in `src/hooks/` |
| Split ParentDashboard | 4 new files in `src/components/parent/` |
| Split ParentChildDetail | 4 new files in `src/components/parent/` |
| Speech hook | `src/hooks/useSpeechRecognition.ts` |
| Memoization | `ParentChildDetail`, `ParentAnalytics` |
| DB indexes | 1 migration |
| N+1 fix | Inside `useChildren.ts` hook |

No breaking changes — all routes and functionality remain identical.

