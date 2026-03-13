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

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (health check) | http://localhost:5001/health |
| PostgreSQL | localhost:5432 |

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

## Database

See [db/README.md](db/README.md) for full schema documentation, table descriptions, and reset instructions.

## Team

- Armin Sandhu
- Ryan Khryss Obiar
- Jason Nguyen
- Sebastian Suarez
- Omar Ahmed
