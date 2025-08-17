#!/usr/bin/env bash
set -e
HOOK_SRC_DIR="$(pwd)/hooks"
HOOK_DST_DIR="$(pwd)/.git/hooks"

if [ ! -d ".git" ]; then
  echo "This repository does not appear to be a git repo. Initialize git first."
  exit 1
fi

for f in "$HOOK_SRC_DIR"/*; do
  fname=$(basename "$f")
  dst="$HOOK_DST_DIR/$fname"
  cp "$f" "$dst"
  chmod +x "$dst"
  echo "Installed hook: $dst"
done

echo "Done installing hooks."
