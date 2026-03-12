
CREATE TABLE public.co_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_parent_id uuid NOT NULL,
  invited_email text NOT NULL,
  invited_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.co_parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own co-parent records" ON public.co_parents
  FOR SELECT TO authenticated
  USING (auth.uid() = primary_parent_id);

CREATE POLICY "Parents can insert own co-parent records" ON public.co_parents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = primary_parent_id);

CREATE POLICY "Parents can delete own co-parent records" ON public.co_parents
  FOR DELETE TO authenticated
  USING (auth.uid() = primary_parent_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.points;
