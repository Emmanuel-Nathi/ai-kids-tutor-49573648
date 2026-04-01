

# Add Mouse-Tracking Head Rotation to OwlScene

## Overview
Add smooth, constrained mouse-tracking to the owl's head inside `OwlScene.tsx`. The owl's head will follow the user's cursor with lerp-based interpolation and ±30° rotation limits.

## Changes — `src/components/OwlScene.tsx`

1. **Add `useEffect` import** and a `headRef` (`useRef<THREE.Object3D>`)

2. **Find the 'Head' node on mount** via `useEffect`:
   - `scene.getObjectByName('Head')` → store in `headRef`
   - Log a warning if not found (model may use different naming)

3. **Add head-tracking inside existing `useFrame`**:
   - Read `state.mouse` (normalized -1 to 1)
   - Calculate target rotations: `targetY = mouse.x * π/6`, `targetX = -mouse.y * π/10`
   - Smoothly interpolate using `THREE.MathUtils.lerp(current, target, 0.1)`

4. **Disable `autoRotate` on OrbitControls** — auto-rotation fights head-tracking and makes it feel unnatural. Keep manual orbit if desired.

No new files or dependencies needed.

