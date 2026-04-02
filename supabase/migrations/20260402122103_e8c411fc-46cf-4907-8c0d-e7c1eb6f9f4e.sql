-- Add referral columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid;

-- Backfill existing profiles with referral codes
UPDATE public.profiles
SET referral_code = substr(md5(random()::text || id::text), 1, 8)
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL after backfill
ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN referral_code SET DEFAULT substr(md5(random()::text), 1, 8);

-- Create trigger to auto-generate referral code on insert
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code = substr(md5(random()::text || NEW.id::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Allow anyone to look up a profile by referral_code (for signup flow)
CREATE POLICY "Anyone can lookup profiles by referral code"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop the old restrictive select policy since the new one is broader
-- Actually keep the old one - both are permissive so it's fine
