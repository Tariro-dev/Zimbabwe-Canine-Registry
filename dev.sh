#!/bin/bash
# Start both backend (API) and frontend (Web) in parallel
pnpm --filter @workspace/api-server --filter @workspace/web dev --parallel
