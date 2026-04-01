

# Fix Owl 3D Scene Animation and Bugs

## Issues Identified

1. **Bobbing/floating animation**: The `Float` component from `@react-three/drei` wraps the headwear and eyewear accessories, causing them to bob up and down independently of the owl. The owl model itself may also appear to move due to the `OrbitControls` polar angle range allowing vertical orbiting, and the mouse-tracking rotation on the X axis creating perceived vertical movement.

2. **Bug in `findHeadNode` heuristic** (line 31): The condition `box.getSize(...).y < box.getSize(...).y * 2` always evaluates to `true` (any number is less than itself times 2), making the heuristic meaningless -- it just picks the highest node regardless of size filtering. This means it likely selects the wrong node (or the root scene group itself).

3. **Excessive console logging in production** (lines 50-53): The model hierarchy is logged on every mount, cluttering the console.

4. **`onLoaded` not in useEffect deps properly**: `onLoaded` is `() => setLoaded(true)` -- an inline arrow function that changes every render, which could cause re-runs of the effect. Should be wrapped in `useCallback` or stabilized.

## Plan

### Step 1: Remove Float wrappers from accessories
Remove the `<Float>` component wrapping headwear and eyewear. These cause the bobbing up-and-down motion. The accessories should be statically positioned relative to the owl.

### Step 2: Fix the `findHeadNode` heuristic
Replace the always-true condition with a meaningful size check -- e.g., filter to nodes whose bounding box height is less than 40% of the total model height, ensuring we pick a head-sized part rather than the entire body.

### Step 3: Constrain mouse-tracking rotation
Reduce the X-axis (vertical) rotation range to prevent the owl from appearing to move up/down when the mouse moves vertically. Tighten `targetX` from `Math.PI / 10` to `Math.PI / 20`.

### Step 4: Remove debug console.logs
Remove the hierarchy traversal logging (lines 50-53) and the head node log (line 58). Keep the warning for missing head node.

### Step 5: Stabilize `onLoaded` callback
Wrap the `onLoaded` prop in `useCallback` to prevent unnecessary re-renders of the effect.

### Files Modified
- `src/components/OwlScene.tsx` -- all changes in this single file

