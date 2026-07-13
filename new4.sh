# Start both backend and frontend in parallel
pnpm --filter @workspace/api-server --filter @workspace/web dev --parallel
