#!/bin/bash
# Zimbabwe Canine Registry - Backend Runner

# Load variables from .env if present
if [ -f .env ]; then
  # This simple way works in most bash environments
  export $(grep -v '^#' .env | xargs)
fi

# Ensure default PORT if not set
export PORT=${PORT:-5000}

echo "Starting Zimbabwe Canine Registry API Server..."
echo "Database: $DATABASE_URL"

pnpm --filter @workspace/api-server run dev
