
-- Service role full access for sessions
CREATE POLICY "Service role full access sessions"
ON public.sessions FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Service role full access for messages
CREATE POLICY "Service role full access messages"
ON public.messages FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- DELETE policy for homework-uploads
CREATE POLICY "Parents can delete homework for own children"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'homework-uploads'
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id::text = (storage.foldername(objects.name))[1]
      AND children.parent_id = auth.uid()
  )
);

-- UPDATE policy for homework-uploads
CREATE POLICY "Parents can update homework for own children"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'homework-uploads'
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id::text = (storage.foldername(objects.name))[1]
      AND children.parent_id = auth.uid()
  )
);
