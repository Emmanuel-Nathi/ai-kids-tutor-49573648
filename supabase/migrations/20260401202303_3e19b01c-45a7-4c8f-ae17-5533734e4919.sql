
-- Grant column-level SELECT to anon (excluding access_pin)
GRANT SELECT (id, name, grade, curriculum_level, selected_curriculum, preferred_language, avatar_url, created_at, updated_at, parent_id) ON public.children TO anon;
