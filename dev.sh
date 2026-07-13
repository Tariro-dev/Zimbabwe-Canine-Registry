#!/bin/bash
# Start both backend and frontend in parallel

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

pnpm -r --filter "@workspace/api-server" --filter "@workspace/web" --parallel run dev
