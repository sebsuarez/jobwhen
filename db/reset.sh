#!/bin/bash
# reset.sh - Full database reset for Neon
# WARNING: This will permanently delete ALL data and rebuild from scratch.
# CONFIRM WITH ALL MEMBERS BEFORE RUNNING.


echo ""
echo "  WARNING: This will delete ALL data in the Neon database."
echo "  This cannot be undone. Make sure your team is aware."
echo ""
read -p "  Type CONFIRM to proceed: " input
echo ""

if [ "$input" = "CONFIRM" ]; then
    echo "  Running reset.sql..."
    psql "$DATABASE_URL" -f db/reset.sql

    echo "  Running schema.sql..."
    psql "$DATABASE_URL" -f db/schema.sql

    echo "  Running seed.sql..."
    psql "$DATABASE_URL" -f db/seed.sql

    echo ""
    echo "  Reset complete. Database has been rebuilt with seed data."
else
    echo "  Aborted. No changes were made."
fi
