
-- Drop the existing anon policy on children base table
DROP POLICY IF EXISTS "Anon can view children safe columns" ON public.children;

-- Restore table-level grants (undo previous column-level attempt)
GRANT ALL ON public.children TO anon;

-- Create a secure view excluding access_pin
CREATE OR REPLACE VIEW public.children_safe AS
SELECT id, name, grade, curriculum_level, selected_curriculum, preferred_language, avatar_url, created_at, updated_at, parent_id
FROM public.children;

-- Grant anon access to the view
GRANT SELECT ON public.children_safe TO anon;
GRANT SELECT ON public.children_safe TO authenticated;

-- No anon SELECT policy on base children table anymore
-- Parents still have their own policy for full access
