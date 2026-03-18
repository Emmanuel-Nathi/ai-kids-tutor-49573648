

# Fix Login Page Bottom Links

## Changes

### 1. `src/pages/Auth.tsx`
- Remove the "Get Started" button (lines 267-274) — redundant
- Replace the existing "Back to Website" button (line 279-281) with a centered `flex-col` container below the card containing:
  - "Child Login" link → navigates to `/child-login`
  - "← Back to Website" link → navigates to `/`

### 2. `src/pages/ChildLogin.tsx`
- Keep "Parent Login Instead" link as-is
- Ensure "← Back to Website" link is present, centered, below the container (lines 116-118 already have this — just confirm styling matches)

Both pages will have consistent bottom sections: centered, stacked links below the card.

