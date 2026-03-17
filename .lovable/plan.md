

# Add reward_claims Realtime + Increase Landing Logo Size

## Changes

### 1. `src/hooks/useSessionHistory.ts` (line 110)
Add a `.on()` listener for the `reward_claims` table in the existing realtime channel, and enable realtime for the table via migration.

### 2. Database migration
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_claims;
```

### 3. `src/pages/Landing.tsx`
- **Header logo** (line 54): Change `w-8 h-8` → `w-12 h-12`
- **Header text** (line 55): Change `text-lg` → `text-xl`

Two small, focused changes. No breaking changes.

