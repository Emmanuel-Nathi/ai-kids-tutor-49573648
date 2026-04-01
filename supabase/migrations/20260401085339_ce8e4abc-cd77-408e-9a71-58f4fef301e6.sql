
-- 1. Inventory Items (store catalog)
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  item_type text NOT NULL,
  xp_cost integer NOT NULL DEFAULT 100,
  material_effect text,
  icon_emoji text DEFAULT '🎩',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read active items" ON public.inventory_items FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Authenticated can read active items" ON public.inventory_items FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Service role full access items" ON public.inventory_items FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 2. Child Inventory (owned items)
CREATE TABLE public.child_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  is_equipped boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, item_id)
);

ALTER TABLE public.child_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can view inventory" ON public.child_inventory FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert inventory" ON public.child_inventory FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update inventory" ON public.child_inventory FOR UPDATE TO anon USING (true);
CREATE POLICY "Parents can view child inventory" ON public.child_inventory FOR SELECT USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_inventory.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can insert child inventory" ON public.child_inventory FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_inventory.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can update child inventory" ON public.child_inventory FOR UPDATE USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_inventory.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Service role full inventory" ON public.child_inventory FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 3. Badges catalog
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_emoji text DEFAULT '🏅',
  xp_award integer NOT NULL DEFAULT 500,
  criteria_type text,
  criteria_value integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read active badges" ON public.badges FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Authenticated can read active badges" ON public.badges FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Service role full access badges" ON public.badges FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 4. Child Badges (earned)
CREATE TABLE public.child_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, badge_id)
);

ALTER TABLE public.child_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can view child badges" ON public.child_badges FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert child badges" ON public.child_badges FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Parents can view child badges" ON public.child_badges FOR SELECT USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_badges.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Parents can insert child badges" ON public.child_badges FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM children WHERE children.id = child_badges.child_id AND children.parent_id = auth.uid()));
CREATE POLICY "Service role full child badges" ON public.child_badges FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
