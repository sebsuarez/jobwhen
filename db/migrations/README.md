# Migrations

Add incremental schema changes here instead of modifying `schema.sql` directly.

## Naming convention

```
NNN_short_description.sql
```

Examples:
- `001_add_avatar_url_to_users.sql`
- `002_add_indexes_to_challenges.sql`

## Example migration file

`001_add_avatar_url_to_users.sql`:

```sql
-- 001_add_avatar_url_to_users.sql
-- Adds a full avatar URL column to replace the short avatar code.

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## How to apply

Run only the new migration against Neon:

```bash
psql "$DATABASE_URL" -f db/migrations/001_add_avatar_url_to_users.sql
```

## When to use reset instead

If the schema change is too complex to migrate incrementally (e.g. early in development), coordinate with your team and use `reset.sh` for a full rebuild:

```bash
bash db/reset.sh
```

Or manually:

```bash
psql "$DATABASE_URL" -f db/reset.sql
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/migrations/001_add_default_target_count_to_challenges.sql
psql "$DATABASE_URL" -f db/migrations/002_add_challenge_recurrence_limit.sql
psql "$DATABASE_URL" -f db/migrations/003_update_goals_table.sql
psql "$DATABASE_URL" -f db/migrations/004_add_last_login_date_to_users.sql
psql "$DATABASE_URL" -f db/seed.sql
```
