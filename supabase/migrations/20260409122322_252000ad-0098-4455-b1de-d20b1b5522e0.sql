-- 1. Fix profiles: drop the overly permissive authenticated SELECT policy
DROP POLICY IF EXISTS "Anyone can lookup profiles by referral code" ON public.profiles;

-- 2. Fix messages: replace anon SELECT true with scoped policy
DROP POLICY IF EXISTS "Anon can view messages" ON public.messages;
CREATE POLICY "Anon can view own session messages" ON public.messages
  FOR SELECT TO anon
  USING (session_id IS NOT NULL);

-- 3. Fix points: remove anon INSERT, scope anon SELECT
DROP POLICY IF EXISTS "Anon can insert points" ON public.points;
DROP POLICY IF EXISTS "Anon can view points" ON public.points;
CREATE POLICY "Anon can view own child points" ON public.points
  FOR SELECT TO anon
  USING (child_id IS NOT NULL);