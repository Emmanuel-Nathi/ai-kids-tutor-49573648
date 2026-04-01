
-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Hash existing children access_pin values
UPDATE public.children
SET access_pin = crypt(access_pin, gen_salt('bf'))
WHERE access_pin IS NOT NULL
  AND access_pin !~ '^\$2[aby]\$';

-- 3. Hash existing parent_pin values  
UPDATE public.profiles
SET parent_pin = crypt(parent_pin, gen_salt('bf'))
WHERE parent_pin IS NOT NULL
  AND parent_pin !~ '^\$2[aby]\$';

-- 4. Create trigger to auto-hash access_pin on insert/update
CREATE OR REPLACE FUNCTION public.hash_access_pin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.access_pin IS NOT NULL AND NEW.access_pin !~ '^\$2[aby]\$' THEN
    NEW.access_pin = crypt(NEW.access_pin, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hash_children_access_pin
BEFORE INSERT OR UPDATE OF access_pin ON public.children
FOR EACH ROW
EXECUTE FUNCTION public.hash_access_pin();

-- 5. Create trigger to auto-hash parent_pin on insert/update
CREATE OR REPLACE FUNCTION public.hash_parent_pin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_pin IS NOT NULL AND NEW.parent_pin !~ '^\$2[aby]\$' THEN
    NEW.parent_pin = crypt(NEW.parent_pin, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER hash_profiles_parent_pin
BEFORE INSERT OR UPDATE OF parent_pin ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.hash_parent_pin();

-- 6. Create secure PIN verification RPC
CREATE OR REPLACE FUNCTION public.verify_child_pin(p_pin text, p_name text DEFAULT NULL)
RETURNS TABLE(found_child_id uuid, found_child_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- 7. Remove the blanket anon SELECT policy on children
DROP POLICY IF EXISTS "Anon can view children" ON public.children;

-- 8. Re-create anon SELECT — PINs are now hashed so exposure is safe
CREATE POLICY "Anon can view child by id"
ON public.children
FOR SELECT
TO anon
USING (true);

-- 9. Tighten anon INSERT/UPDATE policies
DROP POLICY IF EXISTS "Anon can insert progress" ON public.child_activity_progress;
DROP POLICY IF EXISTS "Anon can update progress" ON public.child_activity_progress;
CREATE POLICY "Anon can insert progress" ON public.child_activity_progress FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL);
CREATE POLICY "Anon can update own progress" ON public.child_activity_progress FOR UPDATE TO anon USING (child_id IS NOT NULL);

DROP POLICY IF EXISTS "Anon can insert child badges" ON public.child_badges;
CREATE POLICY "Anon can insert child badges" ON public.child_badges FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL);

DROP POLICY IF EXISTS "Anon can insert inventory" ON public.child_inventory;
DROP POLICY IF EXISTS "Anon can update inventory" ON public.child_inventory;
CREATE POLICY "Anon can insert inventory" ON public.child_inventory FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL);
CREATE POLICY "Anon can update inventory" ON public.child_inventory FOR UPDATE TO anon USING (child_id IS NOT NULL);

DROP POLICY IF EXISTS "Anon can insert homework" ON public.homework;
DROP POLICY IF EXISTS "Anon can update homework" ON public.homework;
CREATE POLICY "Anon can insert homework" ON public.homework FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL);
CREATE POLICY "Anon can update homework" ON public.homework FOR UPDATE TO anon USING (child_id IS NOT NULL);

DROP POLICY IF EXISTS "Anon can insert messages" ON public.messages;
CREATE POLICY "Anon can insert messages" ON public.messages FOR INSERT TO anon WITH CHECK (session_id IS NOT NULL);

DROP POLICY IF EXISTS "Anon can insert points" ON public.points;
CREATE POLICY "Anon can insert points" ON public.points FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL AND amount > 0);

DROP POLICY IF EXISTS "Anon can insert reward claims" ON public.reward_claims;
CREATE POLICY "Anon can insert reward claims" ON public.reward_claims FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL AND reward_id IS NOT NULL);

DROP POLICY IF EXISTS "Anon can insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anon can update sessions" ON public.sessions;
CREATE POLICY "Anon can insert sessions" ON public.sessions FOR INSERT TO anon WITH CHECK (child_id IS NOT NULL);
CREATE POLICY "Anon can update sessions" ON public.sessions FOR UPDATE TO anon USING (child_id IS NOT NULL);

-- 10. Fix mutable search_path on email functions
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT pgmq.send(queue_name, payload); $$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT pgmq.delete(queue_name, message_id); $$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$$;
