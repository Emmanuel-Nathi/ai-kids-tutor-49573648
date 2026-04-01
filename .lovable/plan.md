

# Achievement Room: Inventory, Badges & Customization

## Database (Migration)

Create 4 tables. Note: `child_id` references `children(id)` (not `profiles`) since children are PIN-login users without auth accounts.

```sql
CREATE TABLE public.inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  item_type text NOT NULL, -- 'headwear', 'eyewear', 'book'
  xp_cost integer NOT NULL DEFAULT 100,
  material_effect text, -- 'liquid_glass', 'matte', 'prestige_gradient'
  icon_emoji text DEFAULT '🎩',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.child_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  is_equipped boolean NOT NULL DEFAULT false,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, item_id)
);

CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_emoji text DEFAULT '🏅',
  xp_award integer NOT NULL DEFAULT 500,
  criteria_type text, -- 'streak', 'sessions', 'missions', 'points'
  criteria_value integer, -- e.g. 7 for "7-day streak"
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.child_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(child_id, badge_id)
);
```

RLS: All 4 tables get anon SELECT + INSERT/UPDATE for child sessions, parent access via children join, service role full access. Same pattern as existing `child_activity_progress`.

## Hook: `src/hooks/useAchievementRoom.ts`

- Fetches `child_inventory` joined with `inventory_items` and `child_badges` joined with `badges`
- Derives `equippedItems` map (`{ headwear: 'item-id', ... }`)
- `toggleEquip(itemId, itemType)`: un-equips same-type items, equips selected one
- `purchaseItem(itemId, cost)`: calls `calculate-points` to deduct XP, inserts into `child_inventory`
- `availableItems`: fetches all active `inventory_items` not yet owned

## Page: `src/pages/AchievementRoom.tsx`

Bento grid layout with 4 sections:

1. **Owl Display** (large, colspan-2 on desktop): Shows `OwlMascot` with equipped items indicated visually via overlay badges/tags. No Spline dependency — uses the existing pose-based image system with equipped item indicators rendered as floating badges around the owl.

2. **Badges Shelf**: Frosted-glass card displaying earned badges as glassmorphic "enamel pin" tiles. Locked badges shown grayed with a lock icon.

3. **Item Closet**: Grid of purchasable/owned items. Owned items show equip/unequip toggle. Unpurchased items show XP cost with "Buy" button. Uses existing Tactile Playfulness styling.

4. **Stats Card**: XP total, streak count, sessions — reuses data from `useChildData`.

## Route & Navigation

- Add `/child/:childId/room` route in `App.tsx` wrapped in `AppLayout`
- Add a "My Room" button (Trophy icon) to `ChildHome.tsx` quick-action grid
- Add link from `ChildProfile.tsx` to the room

## Files Created
- `src/hooks/useAchievementRoom.ts`
- `src/pages/AchievementRoom.tsx`

## Files Modified
- `src/App.tsx` — add route
- `src/pages/ChildHome.tsx` — add "My Room" quick-action button
- `src/pages/ChildProfile.tsx` — add link to room

## Design Decision: No Spline
Spline requires an external 3D editor account and hosted assets. Instead, the owl customization will use the existing pose-based image system with equipped items rendered as floating overlay elements (emoji/icon badges positioned around the owl). This keeps the project self-contained and avoids external dependencies.

