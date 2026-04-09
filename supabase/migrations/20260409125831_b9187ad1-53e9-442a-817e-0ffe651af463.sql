-- Remove all anon policies from child-facing tables
-- All child data access now goes through the child-data edge function

-- messages
DROP POLICY IF EXISTS "Anon can view own session messages" ON public.messages;
DROP POLICY IF EXISTS "Anon can insert messages" ON public.messages;

-- sessions
DROP POLICY IF EXISTS "Anon can view own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anon can insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anon can update sessions" ON public.sessions;

-- homework
DROP POLICY IF EXISTS "Anon can view homework" ON public.homework;
DROP POLICY IF EXISTS "Anon can insert homework" ON public.homework;
DROP POLICY IF EXISTS "Anon can update homework" ON public.homework;

-- child_activity_progress
DROP POLICY IF EXISTS "Anon can view progress" ON public.child_activity_progress;
DROP POLICY IF EXISTS "Anon can insert progress" ON public.child_activity_progress;
DROP POLICY IF EXISTS "Anon can update own progress" ON public.child_activity_progress;

-- child_inventory
DROP POLICY IF EXISTS "Anon can view inventory" ON public.child_inventory;
DROP POLICY IF EXISTS "Anon can insert inventory" ON public.child_inventory;
DROP POLICY IF EXISTS "Anon can update inventory" ON public.child_inventory;

-- child_badges
DROP POLICY IF EXISTS "Anon can view own child badges" ON public.child_badges;

-- points
DROP POLICY IF EXISTS "Anon can view own child points" ON public.points;

-- daily_logins
DROP POLICY IF EXISTS "Anon can view daily logins" ON public.daily_logins;

-- reward_claims
DROP POLICY IF EXISTS "Anon can view reward claims" ON public.reward_claims;
DROP POLICY IF EXISTS "Anon can insert reward claims" ON public.reward_claims;

-- rewards (anon SELECT for active rewards)
DROP POLICY IF EXISTS "Anon can view active rewards" ON public.rewards;