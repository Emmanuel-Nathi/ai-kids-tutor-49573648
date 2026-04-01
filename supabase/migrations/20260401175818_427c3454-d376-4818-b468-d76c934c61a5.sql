
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Parents can view own homework uploads" ON storage.objects;
DROP POLICY IF EXISTS "Parents can upload homework" ON storage.objects;

-- Recreate with ownership verification via path convention (child_id/filename)
CREATE POLICY "Parents can view own homework uploads"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'homework-uploads'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id::text = (storage.foldername(name))[1]
      AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can upload homework"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'homework-uploads'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id::text = (storage.foldername(name))[1]
      AND children.parent_id = auth.uid()
  )
);

-- Allow anon (child sessions) to upload/view homework for the child folder
CREATE POLICY "Anon can upload homework"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'homework-uploads'
  AND (storage.foldername(name))[1] IS NOT NULL
);

CREATE POLICY "Anon can view homework"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'homework-uploads'
);

-- Service role full access
CREATE POLICY "Service role full storage access"
ON storage.objects
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
