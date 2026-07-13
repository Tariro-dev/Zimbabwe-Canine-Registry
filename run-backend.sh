#!/bin/bash
# Configuration
export PORT=5000

# 1. PASTE YOUR NEON CONNECTION STRING BELOW
export DATABASE_URL="postgres://YOUR_USER:YOUR_PASSWORD@YOUR_NEON_HOST/neondb?sslmode=require"

echo "Syncing Schema to Neon Cloud..."
pnpm --filter @workspace/db run push

echo "Starting Zimbabwe Canine Registry API Server..."
pnpm --filter @workspace/api-server run dev
