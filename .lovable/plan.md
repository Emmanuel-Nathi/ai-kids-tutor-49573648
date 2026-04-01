

# Replace Geometric Owl with Real GLB Model

## What changes

1. **Copy model to project**: Copy `base_basic_pbr.glb` to `public/models/owl.glb`

2. **Rewrite `src/components/OwlScene.tsx`**:
   - Replace `GeometricOwl` with a new component using `useGLTF('/models/owl.glb')` to load the real model
   - Render via `<primitive object={scene} />` with auto-centering and scaling to fit the viewport
   - Keep the book + page-turn animation and pulsing `PointLight` as separate geometry in front of the owl
   - Keep the dynamic 3D accessories (wizard hat, glasses) — adjust positioning to match the real model's head height (may need tuning)
   - Keep `OrbitControls`, `Environment`, `Float`, and the message overlay unchanged
   - Add `useGLTF.preload('/models/owl.glb')` at module level for faster loading

No other files need changes — `AchievementRoom.tsx` already imports `OwlScene` with the same props.

## Technical notes
- The model's bounding box will be computed on load to auto-center and scale it (using `THREE.Box3`)
- Accessory positions (hat at top of head, glasses at eye level) will be estimated from the bounding box and may need one round of visual tuning
- PBR model works well with the existing `Environment preset="sunset"` for realistic reflections

