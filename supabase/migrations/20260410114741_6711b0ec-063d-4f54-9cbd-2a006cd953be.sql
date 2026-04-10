
-- Invited co-parents can view their own invitations
CREATE POLICY "Invited users can view own co-parent records"
ON public.co_parents FOR SELECT TO authenticated
USING (auth.uid() = invited_user_id);

-- Invited co-parents can update (accept/decline) their own invitations
CREATE POLICY "Invited users can update own co-parent records"
ON public.co_parents FOR UPDATE TO authenticated
USING (auth.uid() = invited_user_id)
WITH CHECK (auth.uid() = invited_user_id);

-- Primary parents can also update their own co-parent records
CREATE POLICY "Primary parents can update own co-parent records"
ON public.co_parents FOR UPDATE TO authenticated
USING (auth.uid() = primary_parent_id)
WITH CHECK (auth.uid() = primary_parent_id);
