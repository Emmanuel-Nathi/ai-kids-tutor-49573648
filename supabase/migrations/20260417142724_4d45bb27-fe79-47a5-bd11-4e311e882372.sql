-- Feedback table for beta tester insights
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Parents can submit feedback for their own children or themselves
CREATE POLICY "Parents can submit feedback for own children"
ON public.feedback FOR INSERT
WITH CHECK (
  (child_id IS NULL AND parent_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.children WHERE id = feedback.child_id AND parent_id = auth.uid())
);

-- Parents can view feedback for own children or themselves
CREATE POLICY "Parents can view own feedback"
ON public.feedback FOR SELECT
USING (
  parent_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.children WHERE id = feedback.child_id AND parent_id = auth.uid())
);

-- Service role full access (for admin reads via edge function)
CREATE POLICY "Service role full feedback"
ON public.feedback FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Allow anonymous feedback submission from child sessions (no auth.uid)
-- Children authenticate via PIN, not Supabase auth, so we need a permissive insert with rate limiting via edge function
CREATE POLICY "Anon can submit feedback for valid child"
ON public.feedback FOR INSERT
TO anon
WITH CHECK (child_id IS NOT NULL AND length(message) > 0 AND length(message) < 2000);

CREATE INDEX idx_feedback_child_id ON public.feedback(child_id);
CREATE INDEX idx_feedback_parent_id ON public.feedback(parent_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);