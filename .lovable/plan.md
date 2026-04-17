## Owl Mascot Animation Enhancements

Make the 3D owl feel more alive: snappier mouse tracking, animated eye movement (pupils that follow the cursor), and richer ambient motion.

### Changes to `src/components/OwlScene.tsx`

**1. More responsive mouse tracking**

- Increase head rotation lerp factor from `0.1` → `0.25` for snappier follow.
- Widen rotation range: horizontal ±35° (from ±30°), vertical ±12° (from ±9°).
- Add subtle body counter-rotation (~30% of head amount) so the whole owl leans toward the cursor.

**2. Animated eyes that track the cursor**

- During the initial scene scan, detect pupil/iris meshes (regex `/pupil|iris/i`) separately from full eye meshes. Fall back to offsetting eye meshes' position if no pupils exist.
- Each frame, translate pupils on local X/Y based on `globalMouse` (clamped to a small offset, e.g. ±0.03 units in local space) with lerp smoothing.
- Cache each pupil's original local position on first frame so movement is relative.
- Keep blink (Y-scale) on the eye meshes as today; pupils ride along with their parent.

**3. Richer idle animation**

- Add a gentle head sway (sine on Y rotation, amplitude ~0.05 rad) layered on top of mouse tracking when cursor is near center.
- Add a periodic "head tilt" micro-gesture every 6–10s (small Z rotation easing in/out over ~0.6s).
- Increase breathing amplitude slightly (`0.015` → `0.022`) and add a tiny vertical bob on the group.

**4. Occasional wing/body flourish**

- Every 12–20s, trigger a brief "perk up" — quick scale pulse (1 → 1.04 → 1) over 400ms — to draw attention without being distracting.

### Changes to `src/components/OwlMascot.tsx` (2D fallback)

- Make `trackMouse` mode also tilt slightly more (range ±15° / ±10°) and reduce spring damping for snappier response.
- Add a subtle eye-shine pulse to the 2D fallback so it feels alive even when 3D is loading.

### Technical notes

- All new motion uses `useFrame` deltas; no new dependencies.
- Pupil offset is applied in local coordinates so it works regardless of head rotation.
- If the GLB has no separable pupil meshes, the fallback (offsetting whole eye meshes by a tiny amount) keeps the effect visible without breaking blink.
- Performance: still a single `useFrame` loop; no extra renders.

### Files touched

- `src/components/OwlScene.tsx` (main animation work)
- `src/components/OwlMascot.tsx` (minor 2D polish)

### Out of scope

- No changes to GLB asset, lighting, or camera.
- No new mascot poses or messages API changes.

Increase the size 