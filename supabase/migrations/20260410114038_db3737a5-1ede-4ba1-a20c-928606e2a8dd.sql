
-- Drop all broken homework-uploads policies
DROP POLICY IF EXISTS "Parents can upload homework" ON storage.objects;
DROP POLICY IF EXISTS "Parents can upload homework for own children" ON storage.objects;
DROP POLICY IF EXISTS "Parents can view homework for own children" ON storage.objects;
DROP POLICY IF EXISTS "Parents can view own homework uploads" ON storage.objects;

-- Recreate with correct path check: objects.name (not children.name)
CREATE POLICY "Parents can view homework for own children"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'homework-uploads'
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id::text = (storage.foldername(objects.name))[1]
      AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can upload homework for own children"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'homework-uploads'
  AND EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id::text = (storage.foldername(objects.name))[1]
      AND children.parent_id = auth.uid()
  )
);
