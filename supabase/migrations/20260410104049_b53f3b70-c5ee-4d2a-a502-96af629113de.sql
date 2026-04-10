
-- Update verify_child_pin to include extensions in search_path
CREATE OR REPLACE FUNCTION public.verify_child_pin(p_pin text, p_name text DEFAULT NULL)
RETURNS TABLE(found_child_id uuid, found_child_name text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name
  FROM public.children c
  WHERE c.access_pin IS NOT NULL
    AND c.access_pin = crypt(p_pin, c.access_pin)
    AND (p_name IS NULL OR c.name ILIKE p_name);
END;
$$;

-- Update hash_access_pin to include extensions in search_path
CREATE OR REPLACE FUNCTION public.hash_access_pin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.access_pin IS NOT NULL AND NEW.access_pin !~ '^\$2[aby]\$' THEN
    NEW.access_pin = crypt(NEW.access_pin, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

-- Update verify_parent_pin to include extensions in search_path
CREATE OR REPLACE FUNCTION public.verify_parent_pin(p_pin text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
      AND parent_pin IS NOT NULL
      AND parent_pin = crypt(p_pin, parent_pin)
  );
END;
$$;

-- Update hash_parent_pin to include extensions in search_path
CREATE OR REPLACE FUNCTION public.hash_parent_pin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.parent_pin IS NOT NULL AND NEW.parent_pin !~ '^\$2[aby]\$' THEN
    NEW.parent_pin = crypt(NEW.parent_pin, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;
