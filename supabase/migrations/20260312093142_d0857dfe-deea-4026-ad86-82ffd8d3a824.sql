
ALTER TABLE public.children 
  ADD COLUMN IF NOT EXISTS selected_curriculum text NOT NULL DEFAULT 'cambridge',
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'english';

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS interaction_summary text,
  ADD COLUMN IF NOT EXISTS curriculum_alignment_score integer;
