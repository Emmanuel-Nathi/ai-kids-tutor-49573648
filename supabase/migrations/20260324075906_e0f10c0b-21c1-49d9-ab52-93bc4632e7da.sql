
-- Anon SELECT policies for child-facing tables

-- children: anon can read any child by ID (UUIDs are unguessable)
CREATE POLICY "Anon can view children" ON public.children
FOR SELECT TO anon USING (true);

-- points: anon can view points
CREATE POLICY "Anon can view points" ON public.points
FOR SELECT TO anon USING (true);

-- points: anon can insert points (for earning XP)
CREATE POLICY "Anon can insert points" ON public.points
FOR INSERT TO anon WITH CHECK (true);

-- sessions: anon can view sessions
CREATE POLICY "Anon can view sessions" ON public.sessions
FOR SELECT TO anon USING (true);

-- sessions: anon can insert sessions
CREATE POLICY "Anon can insert sessions" ON public.sessions
FOR INSERT TO anon WITH CHECK (true);

-- sessions: anon can update sessions (for ending sessions)
CREATE POLICY "Anon can update sessions" ON public.sessions
FOR UPDATE TO anon USING (true);

-- daily_logins: anon can view
CREATE POLICY "Anon can view daily logins" ON public.daily_logins
FOR SELECT TO anon USING (true);

-- messages: anon can view and insert
CREATE POLICY "Anon can view messages" ON public.messages
FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert messages" ON public.messages
FOR INSERT TO anon WITH CHECK (true);

-- rewards: anon can view (to see available rewards)
CREATE POLICY "Anon can view rewards" ON public.rewards
FOR SELECT TO anon USING (true);

-- reward_claims: anon can view and insert
CREATE POLICY "Anon can view reward claims" ON public.reward_claims
FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert reward claims" ON public.reward_claims
FOR INSERT TO anon WITH CHECK (true);

-- homework: anon can view, insert, update
CREATE POLICY "Anon can view homework" ON public.homework
FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert homework" ON public.homework
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update homework" ON public.homework
FOR UPDATE TO anon USING (true);

-- profiles: anon can view (needed for parent PIN verification in sidebar)
CREATE POLICY "Anon can view profiles" ON public.profiles
FOR SELECT TO anon USING (true);
