
-- Role enum
CREATE TYPE public.app_role AS ENUM ('parent', 'child');

-- Profiles table (parent accounts)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  curriculum_level TEXT NOT NULL DEFAULT 'primary',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children" ON public.children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own children" ON public.children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own children" ON public.children FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete own children" ON public.children FOR DELETE USING (auth.uid() = parent_id);

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  active_time_seconds INTEGER NOT NULL DEFAULT 0,
  idle_time_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view sessions of own children" ON public.sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = sessions.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can insert sessions for own children" ON public.sessions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.children WHERE children.id = sessions.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can update sessions of own children" ON public.sessions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = sessions.child_id AND children.parent_id = auth.uid()));

-- Messages table (AI-child chat log)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view messages of own children sessions" ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sessions s
    JOIN public.children c ON c.id = s.child_id
    WHERE s.id = messages.session_id AND c.parent_id = auth.uid()
  ));
CREATE POLICY "Parents can insert messages for own children sessions" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions s
    JOIN public.children c ON c.id = s.child_id
    WHERE s.id = messages.session_id AND c.parent_id = auth.uid()
  ));

-- Homework table
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete')),
  parsed_content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children homework" ON public.homework FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = homework.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can insert homework for own children" ON public.homework FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.children WHERE children.id = homework.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can update own children homework" ON public.homework FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = homework.child_id AND children.parent_id = auth.uid()));

-- Points ledger
CREATE TABLE public.points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children points" ON public.points FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = points.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can insert points for own children" ON public.points FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.children WHERE children.id = points.child_id AND children.parent_id = auth.uid()));

-- Rewards catalog
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  point_cost INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own rewards" ON public.rewards FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own rewards" ON public.rewards FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own rewards" ON public.rewards FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete own rewards" ON public.rewards FOR DELETE USING (auth.uid() = parent_id);

-- Reward claims
CREATE TABLE public.reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children claims" ON public.reward_claims FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = reward_claims.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can insert claims for own children" ON public.reward_claims FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.children WHERE children.id = reward_claims.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can update own children claims" ON public.reward_claims FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.children WHERE children.id = reward_claims.child_id AND children.parent_id = auth.uid()));

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON public.homework FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for homework uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('homework-uploads', 'homework-uploads', false);

CREATE POLICY "Parents can upload homework" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'homework-uploads' AND auth.uid() IS NOT NULL);
CREATE POLICY "Parents can view own homework uploads" ON storage.objects FOR SELECT
  USING (bucket_id = 'homework-uploads' AND auth.uid() IS NOT NULL);
