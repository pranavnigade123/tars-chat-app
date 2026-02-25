#!/bin/bash
# Deploy production Convex with production auth config

# Backup current auth config
cp convex/auth.config.ts convex/auth.config.dev.backup.ts

# Use production auth config
cp convex/auth.config.prod.ts convex/auth.config.ts

# Deploy to production
CONVEX_DEPLOYMENT=prod:fast-lark-394 npx convex deploy

# Restore dev auth config
cp convex/auth.config.dev.backup.ts convex/auth.config.ts
rm convex/auth.config.dev.backup.ts

echo "Production Convex deployed with production Clerk domain"
