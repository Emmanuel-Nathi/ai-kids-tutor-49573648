

# Clean Up Owl Scene & Add Eye Blinking

## What Changes

### 1. Remove the book/page/light in front of the owl
Delete the entire "Book" group (lines 109-122) — the brown book, flipping page, and golden point light. Also remove the `pageRef` and `lightRef` refs and their `useFrame` animation logic since they'll be unused.

### 2. Add random eye blinking
- In `useEffect`, traverse the GLB scene to find meshes with "eye" in their name (case-insensitive) and store refs to them.
- In `useFrame`, implement a blink timer: every 2-6 seconds (random interval), rapidly scale the eye meshes to near-zero on Y axis over ~150ms, then scale back to 1 — creating a natural blink effect.
- If no eye meshes are found in the model, create two small dark sphere overlays positioned at `eyeY` that act as eyelids, scaling in/out on the same random timer.

### Files Modified
- `src/components/OwlScene.tsx` — remove book group, remove unused refs, add blink logic

