
Fix the landing hero so the owl sits fully above “Let’s make homework fun!” with no overlap on mobile or desktop.

What’s causing it
- `Landing.tsx` only gives the owl wrapper `160px` of height.
- `OwlScene.tsx` still renders a fixed `320px`-tall canvas internally.
- That mismatch, combined with `overflow-hidden`, crops the mascot and makes its visible area sit too close to the tagline.

Plan

1. Make `OwlScene` layout-configurable
- Add optional props for container height and vertical model offset.
- Keep the current `320px` default so other pages, especially `AchievementRoom`, do not change.
- Make the loading state use the same configurable height so the layout stays stable.

2. Stop clipping the landing owl
- In `Landing.tsx`, remove the tiny fixed-height wrapper that is forcing the canvas into a cropped area.
- Reserve real vertical space for the mascot in the hero instead of relying on overflow clipping.
- Use larger hero-specific heights for mobile and desktop so the whole owl can fit above the text.

3. Reposition the owl inside the hero canvas
- Apply a small upward Y-offset to the owl model/group only for the landing hero.
- If needed, slightly increase the hero canvas height rather than shrinking the owl into the text area.
- Keep the owl visually close to the tagline, but fully above it.

4. Add safe spacing under the owl
- Add a consistent bottom gap between the owl block and the “Let’s make homework fun!” line.
- Avoid negative margins so the spacing remains reliable across breakpoints.

Files to update
- `src/components/OwlScene.tsx`
- `src/pages/Landing.tsx`

Technical details
- Best fix: match the actual canvas height to the page space reserved for it.
- Add a landing-specific height/offset API to `OwlScene` instead of hardcoding landing layout outside it.
- Preserve the existing mouse tracking and subtle breathing animation.
- Keep the default owl sizing unchanged everywhere except the landing hero.

QA
- Check mobile and desktop widths.
- Confirm the full owl is visible.
- Confirm no part of the owl overlaps the tagline.
- Confirm the owl still tracks the mouse smoothly and the breathing animation still looks natural.
