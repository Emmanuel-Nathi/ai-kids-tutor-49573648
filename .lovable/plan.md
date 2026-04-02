# Fix Owl Mouse Tracking & Remove Mispositioned Eyelids

## Problems

1. **Mouse tracking only works inside the Canvas**: R3F's `state.mouse` only updates when the cursor is over the `<Canvas>` element. Moving the mouse elsewhere on the page has no effect on the owl.
2. **Fallback eyelids appear on the hat**: The fallback sphere eyelids are positioned at `eyeY` (75% of model top), which lands on/near the graduation hat rather than the actual eyes. They need to be removed entirely — the blink logic for model eye meshes can stay, but the mispositioned fallback spheres must go.

## Plan

### Step 1: Global mouse tracking via window listener

- In the `OwlScene` wrapper component, add a `useEffect` with a `window` `mousemove` listener that normalizes cursor position to [-1, 1] range relative to the viewport.
- Store the normalized mouse position in a `useRef` and pass it as a prop to `OwlModel`.
- In `useFrame`, use this prop instead of `state.mouse` so the owl tracks the cursor across the entire page.

### Step 2: Remove fallback eyelid meshes

- Delete the `leftEyelidRef` and `rightEyelidRef` refs and their corresponding `<mesh>` elements (lines 149-157).
- Remove the eyelid scale logic in `useFrame` (lines 131-132).
- Keep the model eye mesh blink logic (lines 126-128) — this only applies if the GLB has eye meshes.
- Remove `hasModelEyes` state since it's only used for the fallback conditional.

### File Modified

- `src/components/OwlScene.tsx`

Please improve the landing page display on mobile, make the entire site more responsive and mobile friendly