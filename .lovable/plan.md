

# Plan: Curriculum Dropdown Enhancement + Activity Filtering

## Current State (Already Implemented)

Most of what you're requesting **already exists** in the codebase:

| Feature | Status |
|---------|--------|
| Curriculum stored on `children.selected_curriculum` | Done |
| Curriculum dropdown in "Add Child" dialog (Cambridge, CAPS, IEB) | Done |
| Activities page filters by curriculum (CAPS → SA History, IEB → Critical Thinking) | Done |
| XP calculated dynamically from `points` table | Done |
| Streak calculated dynamically from `sessions` table | Done |
| Streak displayed with Flame icon on ChildHome + ChildProfile | Done |

## Why NOT add columns to `profiles`

The `profiles` table represents **parents**, not children. Curriculum, XP, and streak belong to children. The architecture already handles this correctly:
- **Curriculum** → `children.selected_curriculum` column
- **XP** → calculated from `points` table (sum of amounts per child)
- **Streak** → calculated from `sessions` table (consecutive days)

Adding these to `profiles` would duplicate data and break the parent-child separation. **No migration needed.**

## Actual Gaps to Close

### 1. Add "General" curriculum option
The dropdown currently has Cambridge, CAPS, IEB. Your request includes "General" as a fourth option.

**Change:** Add `<SelectItem value="general">General</SelectItem>` to the curriculum dropdown in `ParentDashboard.tsx`.

### 2. Add "General" activities to `ChildActivities.tsx`
Currently no activities exist for "general" curriculum. Add a set of general-purpose activities.

### 3. Update curriculum labels
Add "General" to the `curriculumLabels` maps in `ChildActivities.tsx`, `ChildHome.tsx`, and `ChildProfile.tsx`.

### 4. Add "Science Explorer" activity for CAPS
Your request mentions CAPS students seeing "Science Explorer" — currently they see "Natural Sciences Quiz." I'll add "Science Explorer" as an additional CAPS activity.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/ParentDashboard.tsx` | Add "General" option to curriculum dropdown |
| `src/pages/ChildActivities.tsx` | Add "general" activities array + "Science Explorer" to CAPS + update labels |
| `src/pages/ChildHome.tsx` | Add "general" to curriculum labels |
| `src/pages/ChildProfile.tsx` | Add "general" to curriculum labels |

No database migration is needed.

