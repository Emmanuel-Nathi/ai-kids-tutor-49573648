

# Fix Owl Display, Generate Mascot Poses, Add Blob Breathing

## Problem
The `TransparentLogo` component processes all images through a canvas pipeline that strips dark pixels — this corrupts the AI-generated 3D owl mascot which has rich dark colors and textures. The mascot needs to render as-is.

## Changes

### 1. Fix Owl Display — Bypass TransparentLogo (`OwlMascot.tsx`)
- Stop using `TransparentLogo` for the owl mascot — use a plain `<img>` tag instead
- The AI-generated mascot already has a transparent background; the canvas processing is stripping valid dark pixels from the owl's feathers/eyes
- Keep `TransparentLogo` only for the header logo in `Landing.tsx` where it's needed

### 2. Generate 3 New Owl Mascot Images
Use AI image generation (`google/gemini-3-pro-image-preview`) to create:

1. **Hero owl with graduation hat** — `src/assets/owl-mascot.png` (replace existing): 3D owl with graduation cap, frosted-glass spectacles, holding a glowing book, sage/ochre/cloud dancer palette, transparent background
2. **Celebrating owl** — `src/assets/owl-celebrate.png`: Same owl doing a wing-up celebration pose, stars/sparkles around it, graduation cap slightly tilted, transparent background
3. **Listening owl** — `src/assets/owl-listen.png`: Same owl leaning forward, wing cupped to ear, attentive expression, transparent background

### 3. Update OwlMascot Component (`OwlMascot.tsx`)
- Add `pose` prop: `"default" | "celebrate" | "listen"` that selects which image to display
- Import all three mascot images
- Use plain `<img>` tag with `drop-shadow-xl` instead of `TransparentLogo`

### 4. Wire Up Poses in Existing Pages
- `ChildChat.tsx`: Use `pose="listen"` for the empty-state mascot and thinking state
- `ChildHomework.tsx`: Use `pose="celebrate"` for the completion celebration
- `ChildRewards.tsx`: Use `pose="celebrate"` for rewards display (if OwlMascot is used there)
- All other usages keep `pose="default"`

### 5. Add Blob Breathing Animation (`Landing.tsx`)
Add CSS keyframe animation alongside the existing parallax:
- Each blob gets `animate={{ scale: [1, 1.08, 1] }}` with different durations (8s, 12s, 10s) and `repeat: Infinity`
- This stacks with the existing `useTransform` parallax via Framer Motion's `animate` prop on the same `motion.div`

## Files Modified
- `src/components/OwlMascot.tsx` — add `pose` prop, use `<img>` instead of `TransparentLogo`, import new assets
- `src/pages/Landing.tsx` — add breathing animation to blobs
- `src/pages/ChildChat.tsx` — add `pose="listen"` to relevant OwlMascot usages
- `src/pages/ChildHomework.tsx` — add `pose="celebrate"` to completion mascot

## Files Created
- `src/assets/owl-mascot.png` — regenerated with graduation hat
- `src/assets/owl-celebrate.png` — celebrating pose
- `src/assets/owl-listen.png` — listening pose

## Technical Notes
- The `TransparentLogo` component remains untouched — it's still used for the header logo
- The breathing animation uses Framer Motion `animate` which composes cleanly with the `style={{ y: blobY }}` parallax transform
- All three owl images will be generated with transparent backgrounds so no processing is needed

