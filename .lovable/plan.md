

# Weekly Progress Email Summary

## Overview
Create a scheduled edge function that runs every Monday at 7am UTC, sending each parent a summary of their children's activity from the past 7 days.

## Changes

### 1. New Edge Function: `supabase/functions/send-weekly-summary/index.ts`
- Uses service role to query all parents who have at least one child
- For each parent, aggregates the past 7 days of data:
  - Total sessions per child (from `sessions` table)
  - Total XP earned per child (from `points` table)
  - Homework submissions per child (from `homework` table)
  - Active learning time (sum of `active_time_seconds`)
- Builds a branded HTML email matching the existing style (Fredoka font, orange primary, owl branding, logo)
- Enqueues via `supabase.rpc('enqueue_email', ...)` to the `transactional_emails` queue
- Skips parents with zero activity across all children (no empty emails)
- Logs to `email_send_log` with template_name `weekly_summary`

### 2. Update `supabase/config.toml`
Add entry:
```toml
[functions.send-weekly-summary]
  verify_jwt = false
```

### 3. Schedule via pg_cron
Insert a cron job (using the insert tool, not migration) to call the function every Monday at 7:00 UTC:
```sql
SELECT cron.schedule(
  'send-weekly-summary',
  '0 7 * * 1',
  $$ SELECT net.http_post(...) $$
);
```

### Email Content
- Header with logo + "Weekly Learning Report 📊"
- Per-child card showing: name, sessions count, XP earned, time spent, homework submitted
- "View Full Report" CTA button linking to `/parent`
- Footer with unsubscribe note

No database schema changes needed — all data comes from existing tables.

