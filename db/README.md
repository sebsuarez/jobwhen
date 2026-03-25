# Database — Job When?

PostgreSQL 15 database for the Job When? platform.

## Files

| File | Purpose |
|---|---|
| `schema.sql` | Creates all tables, constraints, and indexes. Safe to re-run — drops all tables first. |
| `seed.sql` | Inserts realistic sample data for local development and demos. |

## Tables

| Table | Description |
|---|---|
| `roles` | User roles: `job_seeker`, `mentor`, `admin` |
| `users` | Core user profiles with gamification fields (XP, level, streak) |
| `user_settings` | Per-user UI and privacy preferences (one row per user) |
| `job_applications` | Job applications tracked by each user with status pipeline |
| `application_history` | Audit log of every status change on a job application |
| `goals` | Daily and weekly application count goals per user |
| `xp_events` | Log of every XP gain event and its reason |
| `badges` | Master list of earnable badges |
| `user_badges` | Junction table — badges earned by each user |
| `friendships` | Peer connections with `pending / accepted / blocked / rejected` states |
| `encouragements` | Short supportive messages sent between users |
| `mood_checkins` | Mood score (1–5) and optional reflection text per user |
| `burnout_alerts` | System-generated burnout warnings with a supportive prompt |
| `mentor_profiles` | Extended profile data for approved mentors |
| `challenges` | Community challenges created by mentors |
| `challenge_participants` | Users participating in a challenge and their progress |
| `content_reports` | Moderation reports filed against users or challenges |
| `admin_actions` | Admin decisions (approvals, rejections, warnings) tied to reports/challenges |

## Application Status Pipeline

```
wishlist → applied → interview → offer
                   ↘ rejected
                   ↘ ghosted
```

## How to Apply

To apply manually against a running PostgreSQL instance:

```bash
psql -h localhost -U postgres -d jobwhen -f db/schema.sql
psql -h localhost -U postgres -d jobwhen -f db/seed.sql
```

> `schema.sql` drops and recreates all tables. Running it will erase existing data.
> Only run `seed.sql` after `schema.sql` on a fresh database.

## Resetting the Database

```bash
psql -h localhost -U postgres -d jobwhen -f db/schema.sql
psql -h localhost -U postgres -d jobwhen -f db/seed.sql
```
