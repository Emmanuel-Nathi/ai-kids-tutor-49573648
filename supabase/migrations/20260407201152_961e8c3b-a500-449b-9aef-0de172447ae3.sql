-- Drop the overly permissive anon SELECT policy on children table
DROP POLICY IF EXISTS "Anon can view children via view" ON public.children;