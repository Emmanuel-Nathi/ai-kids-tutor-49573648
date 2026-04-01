
-- 1. Fix children table: remove broad anon SELECT, grant column-level access excluding access_pin
DROP POLICY IF EXISTS "Anon can view child by id" ON public.children;

-- Revoke all anon access and re-grant on safe columns only
REVOKE ALL ON public.children FROM anon;
GRANT SELECT (id, name, grade, curriculum_level, selected_curriculum, preferred_language, avatar_url, created_at, updated_at, parent_id) ON public.children TO anon;

-- Re-create the anon SELECT policy scoped (still needed for RLS pass-through)
CREATE POLICY "Anon can view children safe columns"
ON public.children
FOR SELECT
TO anon
USING (true);

-- 2. Fix rewards: drop broad anon SELECT (children fetch rewards via parent_id after getting it from children table)
DROP POLICY IF EXISTS "Anon can view rewards" ON public.rewards;

-- Add scoped anon policy: children need to read rewards by parent_id
CREATE POLICY "Anon can view active rewards"
ON public.rewards
FOR SELECT
TO anon
USING (is_active = true);

-- 3. Fix storage: remove anon policies on homework-uploads
DROP POLICY IF EXISTS "Anon can view homework" ON storage.objects;
DROP POLICY IF EXISTS "Anon can upload homework" ON storage.objects;

-- 4. Add helper function to check parent PIN existence without exposing hash
CREATE OR REPLACE FUNCTION public.has_parent_pin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND parent_pin IS NOT NULL
  )
$$;
