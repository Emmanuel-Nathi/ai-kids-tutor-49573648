-- Daily logins tracking table
CREATE TABLE public.daily_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  login_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, login_date)
);

ALTER TABLE public.daily_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children daily logins"
ON public.daily_logins FOR SELECT
USING (EXISTS (
  SELECT 1 FROM children WHERE children.id = daily_logins.child_id AND children.parent_id = auth.uid()
));

CREATE POLICY "Parents can insert daily logins for own children"
ON public.daily_logins FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM children WHERE children.id = daily_logins.child_id AND children.parent_id = auth.uid()
));

CREATE POLICY "Service role full access daily logins"
ON public.daily_logins FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_daily_logins_child_date ON public.daily_logins(child_id, login_date DESC);