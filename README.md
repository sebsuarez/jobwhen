# Job When?

A gamified job-search accountability platform for students and new grads. Track applications, set goals, earn XP and badges, connect with peers, and get support from mentors — all in one place.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python / Flask |
| Database | PostgreSQL 15 |
| Infrastructure | Docker / Docker Compose |

## Quick Start

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://csgit.ucalgary.ca/sebastian.suarez/seng513-202601-pg-21.git
cd seng513-202601-pg-21
docker compose up --build
```

### Using Neon (instead of the local Docker DB)

Set `DATABASE_URL` in `.env`, then run:

```bash
docker compose -f docker-compose.yml -f docker-compose.neon.yml up --build --no-deps frontend backend
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (health check) | http://localhost:5001/health |
| PostgreSQL | localhost:5432 |

## Google OAuth Setup

To enable Google sign-in locally, create a Google OAuth client for a web app and use these local URLs during setup:

- Authorized JavaScript origins: `http://localhost:5173`
- Authorized redirect URIs: none required for the Google Identity Services button implemented in this repo

Then copy the template environment file and fill in the same Google web client ID for both frontend and backend:

```bash
cp .env.example .env
```

Set:

- `GOOGLE_CLIENT_ID=...apps.googleusercontent.com`
- `VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com`
- `FRONTEND_ORIGIN=http://localhost:5173`

## Project Structure

```
├── frontend/        # React + Vite app
├── backend/         # Flask API
├── db/
│   ├── schema.sql   # Table definitions, constraints, indexes
│   ├── seed.sql     # Sample data for local development
│   └── README.md    # Database documentation
├── docker-compose.yml
└── how-to-run.md
```

## Database Schema & Seeding

The database is PostgreSQL 15. The schema and seed scripts live in the `db/` directory:

| File | Purpose |
|---|---|
| [`db/schema.sql`](db/schema.sql) | Creates all tables, constraints, and indexes. Drops existing tables first for a clean reset. |
| [`db/seed.sql`](db/seed.sql) | Populates the database with realistic sample data for development and demos. |

### Running with Docker Compose (Recommended)

When you run `docker compose up --build`, the database container automatically executes `schema.sql` then `seed.sql` on first startup — no manual steps required.

Before starting, copy the environment file and set your credentials:

```bash
cp .env.example .env
# edit .env with your POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB values
```

Then start everything:

```bash
docker compose up --build
```

To fully reset the database (drop all data and re-seed):

```bash
docker compose down -v
docker compose up --build
```

### Running Manually

If you have a local PostgreSQL instance running:

```bash
psql -h localhost -U <your_user> -d <your_db> -f db/schema.sql
psql -h localhost -U <your_user> -d <your_db> -f db/seed.sql
```

See [db/README.md](db/README.md) for the full schema documentation and table descriptions.

## Team

- Armin Sandhu
- Ryan Khryss Obiar
- Jason Nguyen
- Sebastian Suarez
- Omar Ahmed
