#!/usr/bin/env bash
# Simple post-commit hook to run the copilot loop locally after commits
NODE=$(which node || true)
if [ -z "$NODE" ]; then
  echo "Node not found; skipping copilot-loop"
  exit 0
fi
node ./scripts/copilot-loop.mjs
