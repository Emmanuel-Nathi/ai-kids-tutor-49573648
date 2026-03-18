

# Date Range Filter + Back to Website Button

## 1. Date Range Filter for Parent Analytics

**Location**: `src/pages/ParentChildDetail.tsx`

Add a date range picker (using existing Popover + Calendar components) above the analytics section. Filter sessions and activity log client-side using `useMemo`.

- Add `dateRange` state: `{ from: Date | undefined, to: Date | undefined }`
- Add preset buttons: "Last 7 days", "Last 30 days", "All time"
- Create a new `DateRangeFilter` component at `src/components/parent/DateRangeFilter.tsx` with:
  - Two date pickers (From / To) using Popover + Calendar
  - Preset quick-select buttons
- In `ParentChildDetail.tsx`, wrap sessions and activityLog with `useMemo` to filter by date range before passing to child components
- Filtered data flows to `ChildStatsRow`, `ParentAnalytics`, `SubjectChart`, `CurriculumMastery`, `ActivityLog`, `SessionHistory`

## 2. "Back to Website" Button

Add a navigation button to return to the landing page (`/`) from both child and parent views.

**Child pages** (`src/pages/ChildHome.tsx`, line 69 header area):
- Add a `Home` icon button in the header that navigates to `/`

**Parent dashboard** (`src/pages/ParentDashboard.tsx`, header area):
- Add a "Back to Website" button near the LogOut button

**Child login** (`src/pages/ChildLogin.tsx`):
- Add a small "Back to Website" link at the bottom

No database changes needed.

