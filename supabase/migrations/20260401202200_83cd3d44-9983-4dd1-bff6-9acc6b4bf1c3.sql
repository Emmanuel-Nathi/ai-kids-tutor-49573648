
-- Drop the SECURITY DEFINER view
DROP VIEW IF EXISTS public.children_safe;

-- Revoke direct anon SELECT on the base children table
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.children FROM anon;

-- Create view as SECURITY INVOKER with security_barrier
CREATE VIEW public.children_safe
WITH (security_barrier = true, security_invoker = true)
AS
SELECT id, name, grade, curriculum_level, selected_curriculum, preferred_language, avatar_url, created_at, updated_at, parent_id
FROM public.children;

-- Grant anon SELECT only on the view (not the base table)
GRANT SELECT ON public.children_safe TO anon;
GRANT SELECT ON public.children_safe TO authenticated;

-- Add anon SELECT policy on base table (required for SECURITY INVOKER view to work)
-- But since we revoked the direct grant, anon can only access through the view
CREATE POLICY "Anon can view children via view"
ON public.children
FOR SELECT
TO anon
USING (true);
