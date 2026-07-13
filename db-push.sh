#!/bin/bash
# Zimbabwe Canine Registry - Database Sync

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Connecting to: $DATABASE_URL"
echo "Pushing database schema..."
pnpm --filter @workspace/db run push
