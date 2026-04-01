
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  grade text NOT NULL,
  curriculum text NOT NULL DEFAULT 'cambridge',
  subject text NOT NULL DEFAULT 'general',
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 30,
  created_by uuid,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.activities FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Authenticated can read active" ON public.activities FOR SELECT
  TO authenticated USING (is_active = true);

CREATE POLICY "Anon can read active" ON public.activities FOR SELECT
  TO anon USING (is_active = true);

CREATE TABLE public.child_activity_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'locked',
  completed_at timestamptz,
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, activity_id)
);

ALTER TABLE public.child_activity_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view progress" ON public.child_activity_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activity_progress.child_id AND children.parent_id = auth.uid()));

CREATE POLICY "Parents can insert progress" ON public.child_activity_progress FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_activity_progress.child_id AND children.parent_id = auth.uid()));

CREATE POLICY "Parents can update progress" ON public.child_activity_progress FOR UPDATE
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_activity_progress.child_id AND children.parent_id = auth.uid()));

CREATE POLICY "Anon can view progress" ON public.child_activity_progress FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert progress" ON public.child_activity_progress FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update progress" ON public.child_activity_progress FOR UPDATE TO anon USING (true);

CREATE POLICY "Service role full progress" ON public.child_activity_progress FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
