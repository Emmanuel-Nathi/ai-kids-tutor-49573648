

# Replace 2D Owl with React Three Fiber 3D Scene

## Context
The Achievement Room currently uses the 2D `OwlMascot` component with emoji overlays for equipped items. This plan replaces the owl display card with an interactive R3F 3D scene.

## Important Note
There is no `owl.glb` model file available. The plan includes a placeholder geometric owl built from Drei primitives (spheres, cones) that can be swapped for a real `.glb` when one is provided. This keeps the feature functional immediately.

---

## 1. Install Dependencies
- `@react-three/fiber@^8.18`
- `@react-three/drei@^9.122.0`
- `three@^0.160`

## 2. Create `src/components/OwlScene.tsx`
A self-contained R3F Canvas component:

- **Geometric Owl**: Built from Drei `Sphere`, `Cone`, and `RoundedBox` primitives — a stylized low-poly owl body, eyes, beak, and an open book in front
- **GLB Loader Ready**: Include a commented-out `useGLTF('/models/owl.glb')` path so swapping to a real model is trivial
- **Page Turn Animation**: `useFrame` loop rotates a thin `RoundedBox` "page" back and forth on its left edge (hinge rotation on Z axis, sinusoidal 0→π over ~3 seconds)
- **Pulsing Book Light**: A `PointLight` positioned above the book with intensity animated via `useFrame` using `Math.sin(clock * 2)` mapped to intensity range [1, 3], color warm gold
- **Dynamic Accessories**:
  - `equippedItems` prop: `Record<string, string>` (same shape as the hook output)
  - If `headwear` is equipped → render a cone/cylinder "hat" positioned above the owl's head
  - If `eyewear` is equipped → render two small torus shapes as glasses on the face
  - If `book` is equipped → change the book's material color
  - Each accessory uses `<Float>` from Drei for subtle hovering
- **Environment**: Drei `<Environment preset="sunset" />` for ambient lighting, `<OrbitControls>` with restricted polar angle so the child can rotate but not flip upside down
- **Props**: `equippedItems: Record<string, string>`, `message?: string`

## 3. Update `src/pages/AchievementRoom.tsx`
- Replace the owl display `Card` content (lines 58-87) with `<OwlScene equippedItems={equippedItems} />`
- Remove the `AnimatePresence` emoji overlay block (no longer needed — accessories are 3D now)
- Keep the message speech bubble below the canvas as a 2D overlay
- Wrap in `<Suspense>` with a loading fallback

## 4. Create `public/models/.gitkeep`
Placeholder directory for future `.glb` model files.

---

## Files Created
- `src/components/OwlScene.tsx` — R3F canvas with geometric owl, animations, accessories
- `public/models/.gitkeep` — placeholder for future 3D assets

## Files Modified
- `src/pages/AchievementRoom.tsx` — swap OwlMascot for OwlScene in the display card
- `package.json` — add three, @react-three/fiber, @react-three/drei

## Technical Notes
- Using `@react-three/fiber@^8.18` and `@react-three/drei@^9.122.0` for React 18 compatibility
- The geometric owl is ~80 lines of JSX primitives — easy to replace with `useGLTF` later
- `useFrame` handles both the page-turn and light-pulse animations in a single render loop
- No `.glb` file is generated — the plan uses built-in Three.js geometries as a stylized placeholder

