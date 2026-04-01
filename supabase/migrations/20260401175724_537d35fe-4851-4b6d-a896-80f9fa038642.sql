
CREATE OR REPLACE FUNCTION public.verify_parent_pin(p_pin text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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
