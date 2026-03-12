
# make sure you are in the root directory
# then run this (when you have docker desktop)
docker compose up --build

# when changing anything in dockerfiles or package*.json
docker compose down
docker compose up --build

# to check running services
docker compose ps

# to check frontend logs
docker compose logs -f frontend

# we can test backend with
http://localhost:5001/health

# we can test frontend with
http://localhost:5173