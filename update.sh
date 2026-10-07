#!/usr/bin/env bash
# Refreshes Copilot pricing (GitHub doc) then model scores (Artificial Analysis).
# Pricing runs first: update-scores.mjs reads data/models.csv.
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Copilot pricing"
node scripts/update-pricing.mjs

echo "→ Artificial Analysis scores"
if [ -f .env ]; then
  node --env-file=.env scripts/update-scores.mjs
else
  node scripts/update-scores.mjs # key may come from the environment
fi
