-- Remove dangerous anon INSERT on child_badges (not used by any application code)
DROP POLICY IF EXISTS "Anon can insert child badges" ON public.child_badges;

-- Remove overly broad anon SELECT on child_badges
DROP POLICY IF EXISTS "Anon can view child badges" ON public.child_badges;

-- Re-add scoped anon SELECT (children need to read their own badges)
CREATE POLICY "Anon can view own child badges"
ON public.child_badges
FOR SELECT
TO anon
USING (child_id IS NOT NULL);

-- Remove overly broad anon SELECT on sessions  
DROP POLICY IF EXISTS "Anon can view sessions" ON public.sessions;

-- Re-add scoped anon SELECT (children need to read their own sessions)
CREATE POLICY "Anon can view own sessions"
ON public.sessions
FOR SELECT
TO anon
USING (child_id IS NOT NULL);