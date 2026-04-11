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

## Running the Scripts

### Option 1: Docker Compose (Recommended)

The schema and seed scripts run **automatically** when the database container starts for the first time. No manual steps required.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

1. Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=jobwhen
```

2. From the project root, start all services:

```bash
docker compose up --build
```

Docker will:
- Build the `db` image from `db/Dockerfile`
- Copy `schema.sql` and `seed.sql` into `/docker-entrypoint-initdb.d/`
- PostgreSQL automatically runs them in order (`01_schema.sql` → `02_seed.sql`) on first startup

The database will be ready at `localhost:5432`.

> To reset the database, stop the containers and remove the volume, then rebuild:
> ```bash
> docker compose down -v
> docker compose up --build
> ```

---

### Option 2: Manual psql (Neon or local)

Run in this order — schema first, then all migrations in order, then seed:

```bash
DB="your_database_url"

psql "$DB" -f db/schema.sql
psql "$DB" -f db/migrations/001_add_default_target_count_to_challenges.sql
psql "$DB" -f db/migrations/002_add_challenge_recurrence_limit.sql
psql "$DB" -f db/migrations/003_update_goals_table.sql
psql "$DB" -f db/migrations/004_add_last_login_date_to_users.sql
psql "$DB" -f db/seed.sql
```

> Migrations use `IF NOT EXISTS` guards and are safe to re-run.
> `seed.sql` truncates all data and resets sequences before inserting — safe to re-run any time.

## Resetting the Database

**With Docker:**
```bash
docker compose down -v
docker compose up --build
```

**Manually (Neon or local):**
```bash
DB="your_database_url"

psql "$DB" -f db/schema.sql
psql "$DB" -f db/migrations/001_add_default_target_count_to_challenges.sql
psql "$DB" -f db/migrations/002_add_challenge_recurrence_limit.sql
psql "$DB" -f db/migrations/003_update_goals_table.sql
psql "$DB" -f db/migrations/004_add_last_login_date_to_users.sql
psql "$DB" -f db/seed.sql
```
