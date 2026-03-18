

# Add Subject Breakdown to Weekly Email

## Overview
Enhance the weekly summary email to include a per-child subject breakdown showing which topics were studied and how many sessions per subject.

## Changes

### 1. Update `supabase/functions/send-weekly-summary/index.ts`

**Data**: When querying sessions for each child, also select the `subject` column. Aggregate into a `Map<string, number>` counting sessions per subject (skip nulls).

**Types**: Add `subjects: Record<string, number>` to the `ChildStats` interface.

**HTML**: After the existing stats table in each child card, render a "Subjects Studied" section with colored pill badges showing subject name and session count (e.g., "Maths × 3", "Science × 2"). Use the existing orange/amber palette for styling.

**Plain text**: Append a "Subjects:" line listing each subject and count.

### 2. Redeploy the edge function

No database or schema changes needed -- the `subject` column already exists on `sessions`.

