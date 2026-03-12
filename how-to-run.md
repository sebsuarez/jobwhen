## Start
- make sure you are in the root directory
- then run this (when you have docker stuff installed)
`docker compose up --build`

## Docker Tests
- to check running services
`docker compose ps`
- to check frontend logs
`docker compose logs -f frontend`

## Frontend Test
- we can test the frontend in real-time
`http://localhost:5173`

## Backend Test
- we can test if the backend is alive
`http://localhost:5001/health`