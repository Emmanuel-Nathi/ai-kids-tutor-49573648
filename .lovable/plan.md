

# Plan: PWA Configuration + ChildSetupWizard

## 1. Configure PWA

### Install dependency
- Add `vite-plugin-pwa` package

### Edit: `vite.config.ts`
- Import `VitePWA` from `vite-plugin-pwa`
- Add `VitePWA` plugin with:
  - `registerType: 'autoUpdate'`
  - Manifest: name "AI Kids Tutor", short_name "AI Tutor", theme_color "#3b82f6", background_color "#ffffff"
  - Icons referencing `/pwa-192x192.png` and `/pwa-512x512.png`

### Edit: `index.html`
- Add `<meta name="theme-color" content="#3b82f6">`
- Add `<link rel="apple-touch-icon" href="/pwa-192x192.png">`
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="default">`

### PWA Icons
- The project's `public/favicon.ico` exists but no PNG icons yet. I'll create placeholder icon files. The user mentioned using the same icon as when publishing — this is the owl logo at `src/assets/logo.png`. I'll copy/reference that as the PWA icons in `public/pwa-192x192.png` and `public/pwa-512x512.png`. Since I can't generate image files directly, I'll configure the manifest to point to the existing `favicon.ico` and `src/assets/logo.png`, and note that the user should place properly sized PNGs in `public/`.

## 2. Create ChildSetupWizard

### Create: `src/components/ChildSetupWizard.tsx`
A multi-step form component:

- **Step 1 — Name**: Input field for child's first name
- **Step 2 — Curriculum**: Grid of selectable Cards for "CAPS", "IEB", "Cambridge" (highlight selected)
- **Step 3 — PIN**: 4-digit PIN via visual number pad (reuse pattern from ChildLogin), with confirmation
- Navigation: "Back" and "Next" buttons, final step shows "Complete Setup"
- On complete: insert into `children` table (parent_id from `useAuth`, name, selected_curriculum, access_pin, default grade "1") then redirect to `/parent`

### Edit: `src/pages/ParentDashboard.tsx`
- Import and use `ChildSetupWizard` inside the "Add Child" dialog instead of (or alongside) the current inline form, OR add a route. Since the user wants it as a standalone wizard experience, I'll replace the current `addChild` dialog content with the `ChildSetupWizard` component, which handles its own multi-step flow and calls the existing insert logic.

### Edit: `src/App.tsx`
- Optionally add a `/parent/add-child` route if the wizard should be a full page. Given the user's description ("redirects to Parent Dashboard"), a full-page approach fits better. I'll add the route and navigate to it from the "Add Child" button.

## Files Summary

| File | Action |
|------|--------|
| `vite.config.ts` | Edit — add VitePWA plugin |
| `index.html` | Edit — add PWA meta tags |
| `src/components/ChildSetupWizard.tsx` | Create — multi-step wizard |
| `src/App.tsx` | Edit — add `/parent/add-child` route |
| `src/pages/ParentDashboard.tsx` | Edit — "Add Child" button navigates to wizard route |

No database changes needed — uses existing `children` table.

