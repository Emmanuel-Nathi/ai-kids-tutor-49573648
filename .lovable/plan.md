

# Generate 3D Owl Mascot + Add Parallax Scrolling

## Part 1: Generate 3D Owl Mascot Image

Use the AI image generation skill to create a "Tactile Playfulness" style 3D owl mascot, then save it to the project assets.

### Steps
1. **Generate the image** using `google/gemini-3-pro-image-preview` with a detailed prompt for a 3D owl in the Tactile Playfulness aesthetic — matte fuzzy feathers, Liquid Glass eyes, Sage Green/Ochre/Cloud Dancer palette, frosted-glass spectacles, holding a glowing book, transparent background, premium studio lighting
2. **Save to project** as `src/assets/owl-mascot.png`
3. **Update imports** in `OwlMascot.tsx` and `Landing.tsx` to use the new mascot image instead of `logo.png` (keep `logo.png` for the header nav logo)

### Files Modified
- `src/components/OwlMascot.tsx` — update import to `owl-mascot.png`
- `src/pages/Landing.tsx` — header keeps `logo.png`, mascot uses new image

---

## Part 2: Parallax Scrolling Effects

Add scroll-driven parallax to the background blobs and section transitions using Framer Motion's `useScroll` and `useTransform`.

### Steps
1. **Background blobs parallax** (`Landing.tsx`): Wrap each blob in a `motion.div` that translates Y at different rates based on scroll progress (e.g., blob 1 moves at 0.3x scroll speed, blob 2 at 0.5x, blob 3 at 0.7x) creating depth layers
2. **Section transitions**: Add `whileInView` animations with slight Y-offset transforms that create a "sliding into place" feel — already partially there, enhance with scale and subtle blur-to-clear transitions
3. Use `useScroll({ target: ref })` for scoped parallax on the hero section

### Technical Detail
```typescript
const { scrollY } = useScroll();
const blob1Y = useTransform(scrollY, [0, 1000], [0, -150]);
const blob2Y = useTransform(scrollY, [0, 1000], [0, -80]);
const blob3Y = useTransform(scrollY, [0, 1000], [0, -200]);
```

Each blob becomes a `motion.div` with `style={{ y: blob1Y }}`.

### Files Modified
- `src/pages/Landing.tsx` — add `useScroll`/`useTransform` for parallax blobs + enhanced section animations

